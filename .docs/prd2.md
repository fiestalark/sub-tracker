# Requirements, Architecture & Technical Design  
### *Subscription Tracker — Supabase‑only Google Auth Edition*  

---

## 1 Introduction  

This Nuxt 3 web application tracks recurring payments by reading a user’s Gmail inbox.  
All authentication and Gmail access are handled **exclusively** by **Supabase Auth** (Google provider).  
The Gmail address chosen at sign‑in is the same mailbox read with scope  
<code>https://www.googleapis.com/auth/gmail.readonly</code>.  
No other OAuth flow or provider is supported in this iteration.

---

## 2 Requirements  

### 2.1 Functional Requirements (MVP)  

| ID | Requirement | Notes |
| --- | --- | --- |
| **FR‑01** | **Google Sign‑in via Supabase Auth** | Scope: <code>openid email profile https://www.googleapis.com/auth/gmail.readonly</code>. One consent screen grants sign‑in **and** Gmail read‑only. |
| **FR‑02** | **Immediate Gmail Sync** | After first login, backend enqueues <code>syncGmail()</code> to pull the latest threads. |
| **FR‑03** | **Email Parsing** | Query: <code>"subscription" OR "receipt" OR "invoice" OR "payment"</code>. Extract sender, subject, date, amount, vendor. Regex first; LLM later. |
| **FR‑04** | **Basic Categorization** | Hard‑coded vendor→category map (Netflix → Streaming, etc.). |
| **FR‑05** | **Dashboard** | Shows totals, renewals, breakdown. Data served by REST; UI never calls Gmail. |
| **FR‑06** | **Digest Notifications** | Weekly / monthly email or in‑app digest with spend summary. |
| **FR‑07** | **User Settings** | Digest frequency, ignore subscriptions, revoke / re‑grant Gmail scope. |

### 2.2 Nice‑to‑Have (Deferred)  

* Renewal‑cycle inference, ML categorization, historical charts, PWA push, multi‑email support.  

### 2.3 Non‑Functional Requirements  

| Category | Detail |
| --- | --- |
| **Security** | Supabase stores OAuth refresh tokens; Edge Function uses per‑user row‑level security. |
| **Performance** | Gmail fetch & parse in Edge Function; dashboard hits pre‑aggregated SQL view. |
| **Scalability** | Supabase Postgres + stateless Edge Functions; cron can scale horizontally. |
| **Maintainability** | Domain logic in composables / server utils; ≤ 200 LOC per file. |

---

## 3 High‑Level Architecture  

| Layer | Responsibility |
| --- | --- |
| **Nuxt Client** | UI & routing, calls backend REST, never touches Gmail directly. |
| **Supabase Auth** | Google provider, token refresh, exposes <code>provider_token</code>. |
| **Supabase DB** | Tables: <code>users</code>, <code>subscriptions</code>, <code>email_logs</code>. |
| **Edge Function syncGmail** | Pulls, parses, stores Gmail data; triggered on login & nightly cron. |
| **REST API** | <code>/api/subscriptions/summary</code>, <code>/api/subscriptions/list</code>, etc. |
| **Digest Scheduler** | Cron checks who needs digests; sends email via SendGrid. |
| **Gmail API** | Read‑only access using Supabase‑issued <code>provider_token</code>. |

---

## 4 Technical Design  

### 4.1 Authentication Flow  

<code>
1. Client ➜ supabase.auth.signInWithOAuth  
   • scopes: openid email profile https://www.googleapis.com/auth/gmail.readonly  
2. Google consent (single screen).  
3. Redirect ➜ /auth/callback.  
4. Page calls supabase.auth.getSessionFromUrl().  
5. Session now contains provider_token + refresh_token.  
6. Server hook enqueues syncGmail(userId) immediately.  
</code>

### 4.2 Data Flow Diagram (Mermaid)  

<code>
flowchart LR
  A[User Login] --> B(Supabase Auth\nGoogle Provider)
  B -->|session + provider_token| C(Nuxt Client)
  C -->|enqueue| D[Edge Function syncGmail]
  D --> E(Gmail API)
  E --> D
  D --> F(Supabase DB)
  F --> G[/api/subscriptions/summary]
  G --> C
  F --> H(Digest Scheduler)
  H --> I(SendGrid)
</code>

### 4.3 Edge Function syncGmail() Algorithm  

<code>
1. Verify event source (login trigger or nightly cron).  
2. Fetch provider_token from Supabase for userId.  
3. Gmail users.messages.list with query string.  
4. For each message ID:  
   • users.messages.get (metadata only)  
   • regex parse amount, vendor, renewal date  
5. Upsert into subscriptions; insert into email_logs.  
6. If Gmail scope revoked ⇒ mark user.needs_regrant = true.  
</code>

### 4.4 Database Schema  

<code>
-- USERS  
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  google_id text UNIQUE,
  email text NOT NULL,
  digest_frequency text DEFAULT 'monthly',
  needs_regrant boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- SUBSCRIPTIONS  
CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  vendor_name text,
  category text,
  amount numeric(10,2),
  currency text DEFAULT 'USD',
  next_renewal_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- EMAIL_LOGS  
CREATE TABLE email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  gmail_message_id text,
  extracted_amount numeric(10,2),
  vendor_name text,
  subscription_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
</code>

---

## 5 Front‑End Specification  

### 5.1 Pages & Key Components  

| Page | Components | States |
| --- | --- | --- |
| **/login** | <code>&lt;GoogleSignInButton&gt;</code>, <code>&lt;ErrorBanner&gt;</code> | idle, loading, error |
| **/auth/callback** | <code>&lt;AppSpinner&gt;</code> | processing, error |
| **/** (dashboard) | header (avatar, email, logout) · <code>&lt;SubscriptionSummary&gt;</code> · <code>&lt;SubscriptionList&gt;</code> · chart placeholder | loading, data, empty |
| **/settings** | <code>&lt;DigestPrefsForm&gt;</code> · <code>&lt;GmailAccessCard&gt;</code> | normal, needsReGrant |

### 5.2 UI States & Routing Rules  

| Condition | Behaviour |
| --- | --- |
| No Supabase session | Redirect to **/login** |
| Session but Gmail scope revoked | Global <code>&lt;ScopeNotice&gt;</code> with “Grant Gmail Access” |
| Session OK | Normal navigation |
| Supabase emits SIGNED_OUT | Force logout ➜ /login |

---

## 6 Backend REST API Contract  

| Route | Method | Purpose |
| --- | --- | --- |
| /api/subscriptions/summary | GET | Returns totals, category & vendor aggregates, next renewals. |
| /api/subscriptions/list | GET | Paginated raw subscription rows. |
| /api/digest/trigger | POST | (Admin) trigger digest email manually. |

All routes require the Supabase JWT from <code>Authorization: Bearer &lt;token&gt;</code>.

---

## 7 Implementation Checklist  

1. Nuxt scaffold ✅  
2. Supabase project + env keys ✅  
3. DB migrations ✅  
4. Supabase Auth (Google) with Gmail scope ✅  
5. Supabase client plugin ✅  
6. Login / callback / dashboard / settings pages 🔲  
7. Edge Function syncGmail() 🔲  
8. REST endpoints 🔲  
9. Digest scheduler & SendGrid integration 🔲  
10. Unit & E2E tests 🔲  
11. Deployment pipeline 🔲  

---

## 8 Open Questions / Future Work  

* LLM parser cost vs. accuracy.  
* Stripe webhook support for receipts outside Gmail.  
* UX for linking multiple mailboxes.  

---

*End of authoritative requirements. Modify this document before implementing any change.*  
