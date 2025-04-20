<template>
  <div>
    <!-- Use the same header or a dedicated settings layout header -->
    <header class="settings-header">
       <h1 class="settings-title">Settings</h1>
       <!-- Optional: Add navigation back to dashboard or user info -->
       <NuxtLink to="/dashboard" class="back-link">Back to Dashboard</NuxtLink>
    </header>

    <main class="settings-main">
      <!-- Section: Re-Consent Gmail Access -->
      <section class="settings-section">
        <h2 class="section-title">Gmail Access</h2>
        <div v-if="needsReGrant" class="regrant-notice">
          <p>Gmail access scope might be missing or revoked. Grant access to enable email scanning.</p>
          <button
            @click="handleReConsent"
            class="regrant-button"
            :disabled="loadingReconsent"
           >
             {{ loadingReconsent ? 'Processing...' : 'Grant Gmail Access' }}
          </button>
           <p v-if="reconsentError" class="reconsent-error">{{ reconsentError }}</p>
        </div>
        <div v-else>
          <p class="access-granted">Gmail read-only access is currently granted.</p>
          <!-- Optional: Add button to revoke? Requires careful handling -->
        </div>
      </section>

      <!-- Section: Session Info -->
      <section class="settings-section">
        <h2 class="section-title">Session Information</h2>
        <div v-if="sessionInfo">
          <p><strong>User ID:</strong> {{ sessionInfo.user?.id }}</p>
          <p><strong>Email:</strong> {{ sessionInfo.user?.email }}</p>
          <p><strong>Expires At:</strong> {{ sessionInfo.expires_at ? new Date(sessionInfo.expires_at * 1000).toLocaleString() : 'N/A' }}</p>
          <p><strong>Granted Scopes:</strong></p>
          <!-- Displaying scopes requires parsing the access token or having metadata. -->
          <!-- Supabase provider_token doesn't directly expose scopes easily client-side -->
          <ul class="scope-list">
            <li>openid</li>
            <li>email</li>
            <li>profile</li>
            <li :class="['scope-item', { 'scope-granted': hasGmailScope, 'scope-missing': !hasGmailScope }]">
               https://www.googleapis.com/auth/gmail.readonly {{ hasGmailScope ? '(Granted)' : '(Missing/Revoked?)' }}
            </li>
            <!-- Note: This scope list is assumed based on login request -->
          </ul>
        </div>
        <div v-else>
          <p>Loading session information...</p>
        </div>
         <button
            @click="refreshSessionInfo"
            class="refresh-session-button"
            :disabled="loadingSession"
         >
           {{ loadingSession ? 'Refreshing...' : 'Refresh Session' }}
         </button>
      </section>

       <!-- Section: Digest Preferences (Placeholder from prd2.md) -->
       <section class="settings-section">
         <h2 class="section-title">Digest Preferences</h2>
         <p>Configure email digest frequency (Monthly, Weekly, Off).</p>
         <!-- Placeholder for <DigestPrefsForm> -->
         <div class="prefs-placeholder">
           (Digest preference form TBD)
         </div>
       </section>

    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, watchEffect } from 'vue' // Removed unused 'computed'
// import { useSupabaseClient, useSupabaseUser } from '#supabase/client' // Removed - rely on auto-import
import { useRouter } from 'vue-router'
import { useSupabaseClient } from '#imports'

const supabase = useSupabaseClient()
const user = useSupabaseUser()

const sessionInfo = ref(null)
const needsReGrant = ref(false) // Will be updated based on scope check
const hasGmailScope = ref(false) // Derived from session check
const loadingSession = ref(false)
const loadingReconsent = ref(false)
const reconsentError = ref('')

async function fetchSessionData() {
  loadingSession.value = true
  const { data, error } = await supabase.auth.getSession()
  if (error) {
    console.error('Error fetching session:', error)
    sessionInfo.value = { error: error.message }
  } else if (data.session) {
    sessionInfo.value = {
        user: data.session.user,
        expires_at: data.session.expires_at,
        // provider_token: data.session.provider_token, // Use cautiously
        // access_token: data.session.access_token // Use cautiously
    }
    // Placeholder Check for Gmail Scope:
    // This is a simplified check. A robust solution might involve:
    // 1. Decoding the access_token (if JWT) client-side (less secure, exposes token)
    // 2. Calling a secure backend endpoint that verifies the token with Google.
    // 3. Storing granted scopes in user_metadata upon login/refresh via an Edge Function/Hook.
    // Assuming for now: if provider_token exists, scope *might* be okay.
    hasGmailScope.value = !!data.session.provider_token; // VERY BASIC CHECK
    needsReGrant.value = !hasGmailScope.value;

  } else {
     sessionInfo.value = null; // No active session
     needsReGrant.value = true; // Assume regrant needed if no session
     hasGmailScope.value = false;
  }
  loadingSession.value = false
}

function refreshSessionInfo() {
    fetchSessionData();
}

async function handleReConsent() {
  loadingReconsent.value = true
  reconsentError.value = ''
  try {
    // Use the same signInWithOAuth function as the login page
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        scopes: 'openid email profile https://www.googleapis.com/auth/gmail.readonly',
        // Crucially, Google might automatically skip consent if already granted
        // or prompt only for the missing scope.
        // redirectTo: `${window.location.origin}/settings` // Redirect back to settings?
      }
    })
    if (error) throw error
    // Redirect might happen, or page might reload/re-render. Watch for session changes.
  } catch (error) {
    console.error('Error during re-consent:', error)
    reconsentError.value = error.error_description || error.message || 'Failed to re-grant access.'
  } finally {
      loadingReconsent.value = false
      // Re-fetch session data after attempt
      // Might need a slight delay or rely on auth watcher
      setTimeout(fetchSessionData, 1000);
  }
}

onMounted(() => {
  fetchSessionData()

  // Redirect to login if user is not authenticated
   watchEffect(() => {
       if (!user.value) {
           const router = useRouter()
           router.push('/login')
       }
   })
});

// Optional: Define layout
// definePageMeta({ layout: 'default' });
</script>

<style scoped>
.settings-header {
  display: flex;
  justify-content: space-between; /* Replaces justify-between */
  align-items: center; /* Replaces items-center */
  padding: var(--space-lg); /* Replaces p-4 */
  border-bottom: 1px solid var(--color-border); /* Replaces border-b */
}

.settings-title {
  font-size: var(--font-xl); /* Replaces text-xl */
  font-weight: 600; /* Replaces font-semibold */
}

.back-link {
  color: var(--color-primary); /* Replaces text-indigo-600 */
  text-decoration: none;
}

.back-link:hover {
  color: var(--color-primary-dark); /* Replaces hover:text-indigo-800 */
  text-decoration: underline;
}

.settings-main {
  padding: var(--space-xl); /* Replaces p-6 */
  display: flex;
  flex-direction: column;
  gap: var(--space-xl); /* Replaces space-y-6 */
}

.settings-section {
  padding: var(--space-lg); /* Replaces p-4 */
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius); /* Replaces rounded */
  box-shadow: var(--shadow-sm); /* Replaces shadow */
}

.section-title {
  font-size: var(--font-lg); /* Replaces text-lg */
  font-weight: 500; /* Replaces font-medium */
  margin-bottom: var(--space-md); /* Replaces mb-3 */
}

.regrant-notice {
  background-color: var(--color-warning-bg); /* Replaces bg-yellow-100 */
  border: 1px solid var(--color-warning-border); /* Replaces border-yellow-400 */
  color: var(--color-warning-text); /* Replaces text-yellow-700 */
  padding: var(--space-md) var(--space-lg); /* Replaces px-4 py-3 */
  border-radius: var(--border-radius); /* Replaces rounded */
  position: relative; /* Replaces relative */
  margin-bottom: var(--space-lg); /* Replaces mb-4 */
}

.regrant-button {
  margin-top: var(--space-sm); /* Replaces mt-2 */
  padding: 0.25rem 0.75rem; /* Approximates px-3 py-1 */
  background-color: var(--color-warning); /* Replaces bg-yellow-500 */
  color: var(--color-warning-button-text); /* Replaces text-white */
  border: none;
  border-radius: var(--border-radius); /* Replaces rounded */
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.regrant-button:hover {
  background-color: var(--color-warning-dark); /* Replaces hover:bg-yellow-600 */
}

.regrant-error {
  color: var(--color-error); /* Replaces text-red-600 */
  font-size: var(--font-sm); /* Replaces text-sm */
  margin-top: var(--space-xs); /* Replaces mt-1 */
}

.access-granted {
  color: var(--color-success); /* Replaces text-green-700 */
}

.scope-list {
  list-style: disc; /* Replaces list-disc */
  margin-left: var(--space-lg); /* Replaces ml-4 */
  padding-left: var(--space-md); /* Replaces list-inside - approximates behavior */
  font-size: var(--font-sm); /* Replaces text-sm */
}

.scope-item {
  /* Base style for list items */
}

.scope-granted {
  color: var(--color-success); /* Replaces text-green-700 */
  font-weight: 600; /* Replaces font-semibold */
}

.scope-missing {
  color: var(--color-error); /* Replaces text-red-600 */
}

.refresh-session-button {
  margin-top: var(--space-md); /* Replaces mt-3 */
  padding: 0.25rem 0.75rem; /* Approximates px-3 py-1 */
  border: 1px solid var(--color-border); /* Replaces border border-gray-300 */
  font-size: var(--font-sm); /* Replaces text-sm */
  border-radius: var(--border-radius); /* Replaces rounded */
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.refresh-session-button:hover {
  background-color: var(--color-surface-hover); /* Replaces hover:bg-gray-50 */
}

.prefs-placeholder {
  margin-top: var(--space-sm); /* Replaces mt-2 */
  color: var(--color-muted); /* Replaces text-gray-500 */
}
</style> 