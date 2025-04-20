<template>
  <div>
    <!-- Use the same header or a dedicated settings layout header -->
    <header class="flex justify-between items-center p-4 border-b">
       <h1 class="text-xl font-semibold">Settings</h1>
       <!-- Optional: Add navigation back to dashboard or user info -->
       <NuxtLink to="/dashboard" class="text-indigo-600 hover:text-indigo-800">Back to Dashboard</NuxtLink>
    </header>

    <main class="p-6 space-y-6">
      <!-- Section: Re-Consent Gmail Access -->
      <section class="p-4 border rounded shadow">
        <h2 class="text-lg font-medium mb-3">Gmail Access</h2>
        <div v-if="needsReGrant" class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mb-4">
          <p>Gmail access scope might be missing or revoked. Grant access to enable email scanning.</p>
          <button
            @click="handleReConsent"
            class="mt-2 px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            :disabled="loadingReconsent"
           >
             {{ loadingReconsent ? 'Processing...' : 'Grant Gmail Access' }}
          </button>
           <p v-if="reconsentError" class="text-red-600 text-sm mt-1">{{ reconsentError }}</p>
        </div>
        <div v-else>
          <p class="text-green-700">Gmail read-only access is currently granted.</p>
          <!-- Optional: Add button to revoke? Requires careful handling -->
        </div>
      </section>

      <!-- Section: Session Info -->
      <section class="p-4 border rounded shadow">
        <h2 class="text-lg font-medium mb-3">Session Information</h2>
        <div v-if="sessionInfo">
          <p><strong>User ID:</strong> {{ sessionInfo.user?.id }}</p>
          <p><strong>Email:</strong> {{ sessionInfo.user?.email }}</p>
          <p><strong>Expires At:</strong> {{ sessionInfo.expires_at ? new Date(sessionInfo.expires_at * 1000).toLocaleString() : 'N/A' }}</p>
          <p><strong>Granted Scopes:</strong></p>
          <!-- Displaying scopes requires parsing the access token or having metadata. -->
          <!-- Supabase provider_token doesn't directly expose scopes easily client-side -->
          <ul class="list-disc list-inside ml-4 text-sm">
            <li>openid</li>
            <li>email</li>
            <li>profile</li>
            <li :class="{ 'text-green-700 font-semibold': hasGmailScope, 'text-red-600': !hasGmailScope }">
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
            class="mt-3 px-3 py-1 border border-gray-300 text-sm rounded hover:bg-gray-50"
            :disabled="loadingSession"
         >
           {{ loadingSession ? 'Refreshing...' : 'Refresh Session' }}
         </button>
      </section>

       <!-- Section: Digest Preferences (Placeholder from prd2.md) -->
       <section class="p-4 border rounded shadow">
         <h2 class="text-lg font-medium mb-3">Digest Preferences</h2>
         <p>Configure email digest frequency (Monthly, Weekly, Off).</p>
         <!-- Placeholder for <DigestPrefsForm> -->
         <div class="mt-2 text-gray-500">
           (Digest preference form TBD)
         </div>
       </section>

    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watchEffect } from 'vue'
// import { useSupabaseClient, useSupabaseUser } from '#supabase/client' // Removed - rely on auto-import
import { useRouter } from 'vue-router'

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
/* Add component-specific styles */
</style> 