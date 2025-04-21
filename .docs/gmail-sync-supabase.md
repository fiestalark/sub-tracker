================
File: .docs/gmail-sync-supabase.md
================
# Gmail Sync — Supabase Actions (atomic checklist)

## A. Database  

1. **Run migration**  
   <code>
   ALTER TABLE users
     ADD COLUMN last_internal_date bigint DEFAULT 0;
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

2. **Row‑Level Security**  
   <code>
   -- enable RLS
   ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
   ALTER TABLE unparsed_emails ENABLE ROW LEVEL SECURITY;

   -- policies
   CREATE POLICY "owner access subscriptions"
     ON subscriptions FOR ALL
     USING (user_id = auth.uid());

   CREATE POLICY "owner access unparsed"
     ON unparsed_emails FOR ALL
     USING (user_id = auth.uid());
   </code>

---

## B. Edge Function (sync‑gmail)

1. **Scaffold**  
   <code>supabase functions new sync-gmail --verify-jwt</code>

2. **index.ts skeleton**  
   <code>
// 1 verify JWT → user_id
// 2 select provider_token, refresh_token from auth.users
// 3 determine 'since' (users.last_internal_date or now‑90d)
// 4 Gmail list & get loops (max 500)
// 5 regex parse → upsert subscriptions
// 6 insert unparsed_emails on failure
// 7 aggregate totals / categories / renewals via SQL
// 8 update users.last_internal_date
// 9 return JSON payload (see spec)
// 10 on Google 401 set needs_regrant = true and return 403
   </code>

3. **Deploy**  
   <code>supabase functions deploy sync-gmail</code>

4. **(Optional later) nightly cron**  
   <code>supabase functions deploy sync-gmail --schedule "0 3 * * *"</code>

---

## C. Environment & Secrets  

*No new secrets required — function reuses Supabase‑stored Google tokens.*

---

## D. Verify  

1. Sign in, hit **Refresh Emails**, expect 200 payload.  
2. Check **subscriptions** and **unparsed_emails** rows.  
3. Revoke Gmail scope → hit refresh → expect 403 and <code>needs_regrant</code> flag.  

---
