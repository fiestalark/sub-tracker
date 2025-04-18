# Updated Requirements: Supabase Auth with Gmail‑Readonly Scope

## 2.1.1 Authentication & Authorization (Revised)
1. **User Sign‑In**  
   - Single “Sign in with Google” flow via Supabase Auth.  
   - Request scopes:  
     <code>openid email profile https://www.googleapis.com/auth/gmail.readonly</code>  
   - Implementation example:  
     <code>const { data, error } = await supabase.auth.signInWithOAuth({  
       provider: 'google',  
       options: {  
         scopes: 'openid email profile https://www.googleapis.com/auth/gmail.readonly'  
       }  
     })</code>  
   - On success, Supabase returns a session that includes <code>provider_token</code> for Gmail API calls.

2. **Token Management**  
   - Supabase Auth automatically handles token refresh.  
   - Access <code>supabase.auth.getSession()</code> or listen to <code>onAuthStateChange</code> to retrieve <code>provider_token</code> when needed.

---

## 4.X Front‑End Requirements

### Pages & Components

#### 1. Login Page (`/pages/login.vue`)
- **Components**  
  - `<GoogleSignInButton>` with Google icon and label “Sign in with Google”  
  - `<ErrorBanner>` to display authentication errors  
- **Behavior**  
  1. User clicks the Google button  
  2. Call <code>supabase.auth.signInWithOAuth(…)</code>  
  3. Show loading spinner until redirect  
  4. After redirect to `/auth/callback`, complete sign‑in  

#### 2. OAuth Callback (`/pages/auth/callback.vue`)
- **Logic**  
  1. Call <code>await supabase.auth.getSessionFromUrl()</code>  
  2. If success → navigate to `/dashboard`  
  3. If error → display `<ErrorBanner>` with retry link  

#### 3. Dashboard (`/pages/dashboard.vue`)
- **Header**  
  - Display user’s avatar and email from <code>supabase.auth.getUser()</code>  
  - `<LogoutButton>` calls <code>supabase.auth.signOut()</code>  
- **Main Content**  
  - **SubscriptionSummary** component showing total spend and upcoming renewals  
  - **SubscriptionList** component listing each vendor, amount, next renewal  
  - `<Button>` “Refresh Emails” to trigger Gmail fetch manually  

#### 4. Settings (`/pages/settings.vue`)
- **Sections**  
  - **Re‑Consent Gmail Access**  
    - If the session’s scopes don’t include Gmail, show a banner with a “Grant Access” button that calls the same <code>signInWithOAuth</code> with extended scopes.  
  - **Session Info**  
    - Display granted scopes and token expiry from <code>supabase.auth.getSession()</code>.  

---

### UI States & Flows

1. **Not Authenticated**  
   - ↳ Render **Login Page**

2. **Authenticated but Missing Gmail Scope**  
   - ↳ On any page, show `<ScopeNotice>` banner with “Grant Gmail Access” button

3. **Authenticated & Gmail Scope Granted**  
   - ↳ Render **Dashboard** and allow full email‑parsing functionality

4. **Token Expired or Revoked**  
   - ↳ Supabase emits `SIGNED_OUT` → redirect to **Login Page**

