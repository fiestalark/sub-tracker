================
File: .docs/gmail-sync-prd.md
================
# Gmail Sync (v0.1) — Product Spec, Architecture & Technical Design  

## 1 Overview  
Add a secure Gmail‑reading pipeline that updates the dashboard and records any messages we can’t parse.  
Processing happens inside a **Supabase Edge Function** called **sync‑gmail**, invoked by the **Refresh Emails** button.

---

## 2 Objectives (Functional Requirements)  
| ID | Requirement |
|----|-------------|
| FR‑01 | Auth‑protected POST to <code>/functions/v1/sync-gmail</code>. |
| FR‑02 | Incremental fetch using <code>users.last_internal_date</code>. |
| FR‑03 | If first run, scan only the last 90 days. |
| FR‑04 | Parse amount, currency, vendor, renewal_date via regex; upsert into <code>subscriptions</code>. |
| FR‑05 | Unparsed messages saved in <code>unparsed_emails</code>. |
| FR‑06 | Response payload includes totals, category sums, renewals, unparsed list. |
| FR‑07 | Max 500 messages per call; return <code>moreAvailable=true</code> if more remain. |
| FR‑08 | On Google 401/invalid_grant mark <code>users.needs_regrant=true</code> and return 403. |

---

## 3 Architecture (runtime flow)  
<code>
graph TD
  A[Nuxt&nbsp;Dashboard] -->|Refresh Emails| B(supabase.functions.sync‑gmail)
  B --> C{Gmail&nbsp;API}
  C --> B
  B --> D[(subscriptions)]
  B --> E[(unparsed_emails)]
  D --> F[/api/subscriptions/summary]
  F --> A
  B -->|needs_regrant=1| G[(users)]
</code>

---

## 4 Data Model Changes  
<code>
-- USERS
ALTER TABLE users
  ADD COLUMN last_internal_date bigint DEFAULT 0;

-- UNPARSED EMAILS
CREATE TABLE unparsed_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  gmail_message_id text,
  subject text,
  sender text,
  message_date timestamptz,
  parse_error text,
  created_at timestamptz DEFAULT now()
);
</code>

---

## 5 Edge Function Contract  

### Request  
*POST* <code>/functions/v1/sync-gmail</code>  
Header: <code>Authorization: Bearer &lt;access_token&gt;</code>  

### Success 200 (body excerpt)  
<code>{
  "processed": 42,
  "updatedSubscriptions": 17,
  "totals": { "monthly": 126.97, "yearly": 655.50 },
  "upcomingRenewals": [
    { "vendor": "Netflix", "amount": 15.99, "due": "2025‑05‑12" }
  ],
  "categoryBreakdown": [
    { "category": "Streaming", "total": 47.97 }
  ],
  "unparsed": [
    { "subject": "Your payment receipt", "sender": "no‑reply@example.com", "date": "2025‑04‑19" }
  ],
  "moreAvailable": false
}</code>  

### Revoked 403  
<code>{ "error": "revoked_or_expired" }</code>

---

## 6 IDE Implementation Steps (atomic)  

1. **Create util** <code>utils/supabaseFunctions.ts</code>  
   • export <code>callFunction(name, opts?)</code> that prepends <code>supabase.functions</code> URL and adds JWT.  

2. **Update composable <code>useDashboard</code>**  
   1. Replace old <code>$fetch('/api/gmail/sync')</code> with  
      <code>const res = await callFunction('sync-gmail')</code>.  
   2. Map payload into new refs: <code>subscriptions</code>, <code>totals</code>, <code>upcoming</code>, <code>categories</code>, <code>unparsed</code>.  
   3. If <code>moreAvailable</code>, show “Fetch More” toast (future).  
   4. On 403 set <code>needsReGrant.value = true</code>.  

3. **Add types** <code>types/gmailSync.ts</code> for response interface.  

4. **Optional UI stub** <code>components/dashboard/UnparsedList.vue</code> listing unparsed msgs.  

5. **Commit & test locally** with mock payload.  

---
