<template>
  <div class="login-page">
    <div v-if="user">
      <p>You are already logged in. Redirecting to dashboard...</p>
      <!-- Optional: Add a spinner -->
    </div>
    <div v-else>
      <h1>Login Required</h1>
      <p>You need to sign in to access this application.</p>
      <ErrorBanner :message="errorMessage" class="error-banner-spacing" />
      <GoogleSignInButton @click="handleSignIn" :disabled="loading" />
      <div v-if="loading" class="loading-indicator">
         <AppSpinner /> <!-- Assuming AppSpinner component -->
        <p>Redirecting to Google...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watchEffect } from 'vue'
import { useSupabaseClient, useSupabaseUser } from '#imports'
import { navigateTo } from '#app'
// Assuming components are auto-imported or imported like this:
import GoogleSignInButton from '~/components/auth/GoogleSignInButton.vue'
import ErrorBanner from '~/components/ui/ErrorBanner.vue'
import AppSpinner from '~/components/ui/AppSpinner.vue'

const supabase = useSupabaseClient()
const user = useSupabaseUser()

const loading = ref(false)
const errorMessage = ref('')

// Redirect if user is already logged in
watchEffect(() => {
  if (user.value) {
    navigateTo('/') // Redirect logged-in users to the main page (index/dashboard)
  }
})

async function handleSignIn() {
  loading.value = true
  errorMessage.value = ''
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        scopes: 'openid email profile https://www.googleapis.com/auth/gmail.readonly',
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    if (error) throw error
    // Redirect happens via Supabase
  } catch (error) {
    console.error('Error signing in from login page:', error)
    errorMessage.value = error.error_description || error.message || 'Login failed.'
    loading.value = false
  }
}

definePageMeta({
  layout: 'minimal' // Use a minimal layout if available, otherwise default
});
</script>

<style scoped>
.login-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh; /* Adjust height as needed */
  text-align: center;
  padding: var(--space-lg);
}

.login-page h1 {
  font-size: var(--font-2xl);
  margin-bottom: var(--space-md);
}

.login-page p {
  color: var(--color-muted);
  margin-bottom: var(--space-lg);
}

/* Added styles */
.error-banner-spacing {
  margin-bottom: var(--space-lg); /* Replaces mb-4 */
}

.loading-indicator {
  margin-top: var(--space-lg); /* Replaces mt-4 */
  text-align: center; /* Replaces text-center */
}

/* Assuming GoogleSignInButton might need some margin */
.google-signin-button {
  margin-top: var(--space-md);
}

</style> 