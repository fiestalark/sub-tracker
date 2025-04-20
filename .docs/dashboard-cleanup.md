# Dashboard Unification & Routing Cleanup — **Requirements v1.0**

## 1 Overview  
There are two competing dashboard implementations:

| File | Route | Status |
|------|-------|--------|
| <code>pages/index.vue</code> | <code>'/'</code> | ✅ Desired UI, correct CSS |
| <code>pages/dashboard.vue</code> | <code>'/dashboard'</code> | ❌ Out‑of‑date styles, owns Gmail‑sync JS |

This duplication causes an un‑styled flash on first load (user is redirected to <code>/dashboard</code>), and splits logic between two views.

---

## 2 Goals  
1. **Single source‑of‑truth UI** — keep the styled markup now in <code>index.vue</code>.  
2. **Canonical dashboard route <code>'/'</code>** — all post‑login redirects & nav links land here.  
3. **Shared logic** — expose Gmail‑sync & state via a composable usable by any view/component.  
4. **DRY refresh‑emails button** — any instance triggers the same composable action.  

---

## 3 Functional Requirements  

| ID | Requirement | Notes |
|----|-------------|-------|
| **FR‑01** | **Post‑auth redirect ➜ <code>'/'</code>** | Update <code>supabase.redirectOptions.callback</code> to <code>'/'</code> and any <code>navigateTo()</code> calls in <code>auth/callback.vue</code>. |
| **FR‑02** | **Create composable <code>useDashboard()</code>** | Houses Supabase session, Gmail‑sync, subscription fetch, and UI state (<code>isLoading</code>, <code>syncStatus</code>, etc.). |
| **FR‑03** | **Move dashboard markup to new component** | Extract entire template + scoped CSS from <code>index.vue</code> into **<code>components/dashboard/Dashboard.vue</code>** (or reuse/rename old <code>pages/dashboard.vue</code>). |
| **FR‑04** | **Refactor <code>pages/index.vue</code>** | Acts as thin wrapper that: <br>  • imports <code>&lt;Dashboard /&gt;</code><br>  • renders it if session OK<br>  • else shows landing hero. |
| **FR‑05** | **Remove/repurpose <code>pages/dashboard.vue</code>** | Either delete to avoid duplicate route or convert to stub that forwards to <code>'/'</code> via <code>navigateTo('/') </code>. |
| **FR‑06** | **Refresh‑emails button uses composable** | All buttons call <code>const { refreshEmails } = useDashboard()</code>. |

---

## 4 Architecture Updates  

### 4.1 Directory & Route Map (After Refactor)

| Layer | File | Responsibility |
|-------|------|----------------|
| **Page (root)** | <code>pages/index.vue</code> | Landing ✦ Auth‑protected wrapper that mounts dashboard component. |
| **Component** | <code>components/dashboard/Dashboard.vue</code> | Entire dashboard UI (template + CSS). |
| **Composable** | <code>composables/useDashboard.ts</code> | Handles Supabase user, Gmail scope checks, Gmail sync, querying subscription data. |
| **Auth Callback** | <code>pages/auth/callback.vue</code> | On success ➜ <code>navigateTo('/') </code>. |

### 4.2 Composable API (contract)

<code>
export function useDashboard () {
  // STATE
  const user        = useSupabaseUser()
  const isLoading   = ref(false)
  const syncStatus  = ref('')
  const subscriptions = ref([])

  // ACTIONS
  async function refreshEmails () { … }   // POST /api/gmail/sync
  async function loadSubscriptions () { … }

  // INIT
  watchEffect(() => { if (user.value) loadSubscriptions() })

  return { user, isLoading, syncStatus, subscriptions, refreshEmails }
}
</code>

The composable **does not** touch routing or presentation; each view decides how to display state.

---

## 5 Technical Design  

### 5.1 Redirect Flow  
1. User finishes OAuth in <code>auth/callback.vue</code>.  
2. PKCE exchange completes → <code>useSupabaseUser()</code> becomes truthy.  
3. Callback page immediately runs <code>navigateTo('/') </code>.  
4. Global <code>auth.global.ts</code> middleware already guards private routes; no change needed.

### 5.2 pages/index.vue (wrapper template)

<code>
&lt;template&gt;
  &lt;div&gt;
    &lt;Dashboard v-if="user" /&gt;
    &lt;LandingHero v-else /&gt;
  &lt;/div&gt;
&lt;/template&gt;

&lt;script setup&gt;
import { useSupabaseUser } from '#imports'
import Dashboard from '@/components/dashboard/Dashboard.vue'
import LandingHero from '@/components/landing/Hero.vue'

const user = useSupabaseUser()
&lt;/script&gt;
</code>

### 5.3 Dashboard Component

Import composable and wire buttons:

<code>
&lt;script setup&gt;
import { useDashboard } from '@/composables/useDashboard'

const { subscriptions, isLoading, syncStatus, refreshEmails } = useDashboard()
&lt;/script&gt;
…
&lt;AppButton @click="refreshEmails" :disabled="isLoading"&gt;Refresh Emails&lt;/AppButton&gt;
</code>

### 5.4 Handling Legacy Route

Option A (recommended): delete <code>pages/dashboard.vue</code>.  
Option B: keep it, but inside:

<code>
export default defineNuxtRouteMiddleware(() =&gt; navigateTo('/'))
</code>

---

## 6 Migration Steps  

1. **Create composable** <code>composables/useDashboard.ts</code> and move JS from both pages.  
2. **Extract** template + CSS from <code>pages/index.vue</code> into <code>components/dashboard/Dashboard.vue</code>.  
3. **Refactor** <code>pages/index.vue</code> to wrapper shown above.  
4. **Update redirects** in <code>supabase.redirectOptions.callback</code> (in <code>nuxt.config.ts</code>) and in <code>auth/callback.vue</code>.  
5. **Remove dup route** (<code>pages/dashboard.vue</code>) or redirect to root.  
6. **Ensure navbar** link already points to <code>'/'</code> (no change).  
7. **QA**:  
   * Sign‑in flow lands on styled dashboard.  
   * Refresh emails button works on dashboard.  
   * Direct navigation to <code>/dashboard</code> (if kept) redirects/forwards correctly.  

---

## 7 Open Questions / Confirmation Needed  

* Should we **delete** <code>pages/dashboard.vue</code> entirely (preferred) or keep as redirect stub?  
* Any other feature flags or page‑level middleware that assume route <code>'/dashboard'</code>?  

Please confirm or adjust before implementation.
