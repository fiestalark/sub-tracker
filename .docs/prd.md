# Requirements, Architecture, and Technical Design with Supabase

## 1. Introduction

This document outlines the requirements and technical design for a subscription-tracking web application built with **Nuxt.js**. The application will connect to a user’s Gmail account (via OAuth) to parse subscription-related emails, categorize them, calculate total subscription costs, and provide digest notifications. **In this iteration, we use [Supabase](https://supabase.com/) as the backend for both database and authentication layers.**

## 2. Requirements

### 2.1 Functional Requirements (MVP)
1. **User Authentication & Authorization**
   - Users can sign in with Google (OAuth 2.0).
   - Read-only access to Gmail (scope: <code>https://www.googleapis.com/auth/gmail.readonly</code>).
   - Optionally, leverage Supabase Auth (if needed) for additional security or user management features.

2. **Email Parsing**
   - Search emails for subscription-related keywords (<code>"subscription", "receipt", "invoice", "payment"</code>).
   - Extract relevant data:
     - Sender
     - Subject
     - Date
     - Amount
     - Vendor Name
   - Use regex or an LLM-based approach to parse the email bodies for key values (amount, subscription date, etc.).

3. **Basic Categorization**
   - Hardcode vendor-to-category mapping (e.g., Netflix → “Streaming”).
   - Store category along with subscription info.

4. **Dashboard View**
   - Display:
     - Total monthly spending
     - List of subscriptions: vendor, amount, renewal cycle, next due date
   - Allow user to see aggregated data by category or vendor.

5. **Digest Delivery**
   - Send digest notifications via email or in-app message.
   - Digest includes:
     - Total spend in the current month
     - Breakdown by category and vendor
     - Upcoming renewal dates

6. **User Settings**
   - User can select digest frequency (weekly or monthly).
   - User can ignore (or remove) certain subscriptions.

### 2.2 Nice-to-Have Features (Future Enhancements)
1. **Automatic Renewal Cycle Detection**  
   - Infer monthly, yearly, or other intervals from email content and patterns.
2. **More Sophisticated Categorization**  
   - ML or advanced rule-based system for vendor categorization.
3. **Analytics & Charts**  
   - Historical spending trends and interactive charts.
4. **Mobile App/PWA**  
   - Provide push notifications for upcoming renewals.
5. **Multi-Email Support**  
   - Connect multiple Gmail accounts to one user profile.

### 2.3 Non-Functional Requirements
1. **Security**  
   - Use Supabase Auth for storing user tokens securely (or handle within your own system).
2. **Performance**  
   - Optimized queries and background jobs to handle email parsing efficiently.
3. **Scalability**  
   - Supabase scales with the project (Postgres under the hood, horizontally scalable).
4. **Maintainability**  
   - Modular architecture for adding more categories, data models, or email parsing rules in the future.

---

## 3. High-Level Architecture

1. **Client (Nuxt.js)**  
   - UI for user interactions, dashboards, and settings.
   - Integration with Gmail OAuth flow and Supabase Auth.

2. **Supabase**  
   - **Database**: PostgreSQL managed by Supabase.
   - **Auth**: (Optional) use Supabase Auth for session management or integrate your own Google OAuth with Gmail read-only scope.
   - **API / Edge Functions**: If needed, use Supabase’s Edge Functions for serverless logic (e.g., digest scheduling, email parsing).

3. **Gmail API**  
   - OAuth 2.0 for secure access to read emails.
   - Gmail REST API to fetch and parse incoming messages.

4. **Scheduled/Background Jobs**  
   - Could be implemented using Supabase Edge Functions + cron triggers or an external CRON-based system for digest sending and email scanning.

5. **Email Delivery**  
   - Use an email service (SendGrid, AWS SES, or Gmail API) to send digests and notifications.

---

## 4. Technical Design

### 4.1 Technology Stack
- **Front End**: Nuxt.js (Vue 3, optional TypeScript).
- **Supabase**:
  - **Database**: PostgreSQL (managed by Supabase).
  - **Auth**: Use Supabase’s built-in Auth or keep user tokens yourself.
  - **Edge Functions**: For serverless functionality if needed.
- **Authentication**: Google OAuth 2.0 (for Gmail).
- **Email Parsing**: Gmail API, plus regex or LLM approach.
- **Email Delivery**: Third-party service or Gmail API for sending.

### 4.2 Data Flow Overview
1. **User Signs In**  
   - Via Google OAuth or Supabase Auth (depending on setup).
   - On success, user’s data is stored in Supabase DB or just session data is stored.  
2. **Email Retrieval**  
   - Use the Gmail API with the user’s tokens to fetch messages containing relevant keywords.
3. **Parsing & Categorization**  
   - Identify subscription info in messages.
   - Store in Supabase table with vendor, amount, next renewal, etc.
4. **Dashboard & Digest**  
   - Show aggregated data in Nuxt.js UI.
   - Generate and email periodic digests to the user.

### 4.3 Supabase Database Structure

*(See next code block for exact CREATE TABLE queries.)*

- **Users Table**  
  Stores user profile details and possibly links to Supabase Auth ID or Google ID.
- **Subscriptions Table**  
  Holds user subscriptions with vendor details, amounts, next renewal, category, etc.
- **Email Logs Table**  
  Optionally store raw email references or parsed info for debugging.

### 4.4 Gmail Integration
1. **OAuth 2.0 Flow**  
   - Obtain read-only access token for Gmail.
   - Store tokens in Supabase or rely on ephemeral token usage.  
2. **Messages Fetch**  
   - Use the Gmail API (`/gmail/v1/users/{userId}/messages`) with query params like `<code>subscription OR receipt OR invoice OR payment</code>`.
3. **Parsing Logic**  
   - Regex to detect amounts, vendor names, subscription dates.
   - Or use an LLM-based approach.

### 4.5 Categorization
- Define a dictionary for vendor-to-category mapping.
- Example:
  <code>{
    "Netflix": "Streaming",
    "Spotify": "Music",
    ...
  }</code>
- Default to “Uncategorized” if no match.

### 4.6 Dashboard & UI
1. **Login Page**  
   - Google OAuth or Supabase Auth.  
2. **Main Dashboard**  
   - Monthly subscription totals, upcoming renewals, vendor list.  
3. **Settings**  
   - Update digest frequency, exclude or ignore subscriptions.

### 4.7 Digest Delivery
1. **Frequency**  
   - Weekly or monthly, configured per user.  
2. **Scheduler**  
   - Could use Supabase’s [Scheduled Triggers](https://supabase.com/docs/guides/database/scheduled-triggers) or an external service to run daily checks.  
3. **Notification**  
   - Summarize monthly spend, breakdown, upcoming renewals.  
   - Send email via a third-party service or directly via Gmail API.

### 4.8 Implementation Steps
1. **Nuxt.js Setup**: `npx nuxi init subscription-tracker`  ✅ COMPLETE
2. **Supabase Project**  ✅ COMPLETE
   - Create a new project on supabase.com.  
   - Get project URL, anon key, service role key, etc.  
3. **Database & Tables**  ✅ COMPLETE
   - Use the provided SQL to create tables.  
4. **Configure Supabase Client** in Nuxt  ✅ COMPLETE
   - Install `@supabase/supabase-js`.  
   - Provide your `SUPABASE_URL` and `SUPABASE_ANON_KEY`.  
5. **OAuth Integration**  
   - If you’re using Google OAuth for Gmail in addition to Supabase Auth, ensure to handle token storage.  
6. **Gmail Parsing & Subscription Handling**  
   - Implement the fetch + parse logic, store results in Supabase.  
7. **Digest Scheduling**  
   - Use Supabase Scheduled Triggers or external cron.  
8. **UI/UX Polishing & Testing**.

---

## 5. Supabase SQL Queries

<code>
-- USERS TABLE
CREATE TABLE users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  google_id text UNIQUE,
  email text NOT NULL,
  digest_frequency text DEFAULT 'monthly',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- SUBSCRIPTIONS TABLE
CREATE TABLE subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES users (id) ON DELETE CASCADE,
  vendor_name text,
  category text,
  amount numeric(10,2),
  currency text DEFAULT 'USD',
  next_renewal_date date,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- EMAIL LOGS TABLE
CREATE TABLE email_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES users (id) ON DELETE CASCADE,
  gmail_message_id text,
  extracted_amount numeric(10,2),
  vendor_name text,
  subscription_date timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
</code>
