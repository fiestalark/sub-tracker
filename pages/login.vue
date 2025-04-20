<template>
  <div class="flex flex-col items-center justify-center min-h-screen">
    <h1 class="text-3xl font-bold mb-6">Subscription Tracker</h1>
    <div class="w-full max-w-xs">
      <ErrorBanner :message="errorMessage" class="mb-4" />

      <GoogleSignInButton @click="handleSignIn" :disabled="loading" />

      <div v-if="loading" class="mt-4 text-center">
        <!-- Basic Spinner Placeholder -->
        <p>Loading...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
// import { useSupabaseClient } from '#supabase/client' // Removed - rely on auto-import

// Assume useSupabaseClient composable provides the Supabase instance
const supabase = useSupabaseClient()

const loading = ref(false)
const errorMessage = ref('')

async function handleSignIn() {
  loading.value = true
  errorMessage.value = ''

  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        scopes: 'openid email profile https://www.googleapis.com/auth/gmail.readonly',
        // Optional: specify redirect URL if needed, otherwise Supabase defaults
        // redirectTo: `${window.location.origin}/auth/callback`
      }
    })

    if (error) throw error

    // If successful, Supabase handles the redirect automatically.
    // Loading state will persist until the page redirects.

  } catch (error) {
    console.error('Error signing in with Google:', error)
    errorMessage.value = error.error_description || error.message || 'An unexpected error occurred.'
    loading.value = false
  }
}

// Define page meta or layout if necessary
// definePageMeta({ layout: 'auth' });
</script>

<style scoped>
/* Add any specific styles if needed */
</style> 