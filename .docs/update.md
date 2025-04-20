# Auth & Navbar UX Update — Requirements v1.0

## 1 Overview  
Unify Google sign‑in across the app, keep the UI reactive to the Supabase session, and ensure the Gmail read‑only OAuth scope is granted.

---

## 2 Functional Requirements

| ID | Requirement | Details |
|----|-------------|---------|
| **FR‑01** | **Single OAuth entry point** | Both the **Login** link in the navbar and the **Sign in with Google** button on the landing page call <code>supabase.auth.signInWithOAuth({ provider: 'google', options: { scopes: 'openid email profile https://www.googleapis.com/auth/gmail.readonly' } })</code>. |
| **FR‑02** | **Session‑aware navbar** | After a successful redirect the navbar replaces **Login** with the user’s <code>session.user.email</code> and shows a **Logout** button. When <code>useSupabaseUser()</code> is <code>null</code>, the navbar reverts to **Login**. |
| **FR‑03** | **Landing page state** | • If signed out: hero + **Sign in with Google** button.<br>• If signed in: hero/button hidden, dashboard grid rendered. |
| **FR‑04** | **Route protection** | Auth‑only routes redirect to <code>/login</code> when <code>useSupabaseUser().value</code> is <code>null</code>. |
| **FR‑05** | **Log out flow** | Clicking **Logout** triggers <code>supabase.auth.signOut()</code> and navigates to <code>/login</code>. |
| **FR‑06** | **Session persistence** | On refresh Nuxt hydrates the stored session so no flash of the logged‑out state appears. |

---

## 3 User‑Experience & UI

### 3.1 Navbar (layouts/default.vue)

| State | Elements |
|-------|----------|
| **Signed out** | Logo · optional nav links · **Login** link |
| **Signed in** | Logo · nav links · <code>&lt;user.email&gt;</code> label · **Logout** |

### 3.2 Landing (/pages/index.vue)

| State | Behaviour |
|-------|-----------|
| **Signed out** | Hero + **Sign in with Google** button |
| **Signed in** | Dashboard grid (same as <code>/dashboard</code>) |

---

## 4 Technical Design

### 4.1 Composables
<code>
const user = useSupabaseUser()  
const supabase = useSupabaseClient()
</code>

### 4.2 Navbar logic
<code>
const login = () =&gt; supabase.auth.signInWithOAuth({  
  provider: 'google',  
  options: { scopes: 'openid email profile https://www.googleapis.com/auth/gmail.readonly' }  
})  
const logout = () =&gt; supabase.auth.signOut()
</code>

### 4.3 Global middleware (middleware/auth.global.ts)
<code>
export default defineNuxtRouteMiddleware(() =&gt; {  
  const user = useSupabaseUser()  
  const path = useRoute().path  
  const publicPages = ['/login', '/auth/callback']  
  if (!user.value && !publicPages.includes(path)) return navigateTo('/login')  
})
</code>

### 4.4 Landing‑page switch
<code>
const showDashboard = computed(() =&gt; !!useSupabaseUser().value)
</code>

---

## 5 Non‑Functional Requirements
* **Accessibility** – buttons have aria labels and focus rings.  
* **Performance** – prevent flicker by rendering only after session hydration.  
* **Security** – logout clears any cached Gmail data.

---

## 6 Open Tasks
1. Remove hard‑coded <code>ref(null)</code> user stubs from layouts/pages.  
2. Convert existing <code>Login.vue</code> to a minimal wrapper (optional).  
3. Unit tests for navbar state, middleware redirects.  
4. Update <code>.docs/auth.md</code> & <code>.docs/design.md</code> accordingly.
