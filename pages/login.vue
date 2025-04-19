<template>
  <div class="login-page">
    <div class="hero-section">
      <h1>Track Your Subscriptions Effortlessly</h1>
      <p class="subheading">
        Connect your Gmail to automatically find and manage your recurring payments.
      </p>
      <AppButton @click="handleLogin" class="login-button">
        <!-- Add Google Icon SVG/Component here later -->
        <span class="icon-placeholder">G</span> Sign in with Google
      </AppButton>
      <p v-if="error" class="error-message">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
// Use the default layout
definePageMeta({
  layout: 'default'
})

// Placeholder for error messages
const error = ref(null)

// Placeholder for the actual login logic
const handleLogin = async () => {
  error.value = null // Clear previous errors
  console.log('Login button clicked - Implement Google OAuth flow here');
  try {
    // Example using Nuxt Supabase module (uncomment and adapt)
    // const supabase = useSupabaseClient()
    // const { error: authError } = await supabase.auth.signInWithOAuth({
    //   provider: 'google',
    //   options: {
    //     redirectTo: `${window.location.origin}/auth/callback`, // Your callback URL
    //     queryParams: {
    //       access_type: 'offline',
    //       prompt: 'consent',
    //       scope: 'https://www.googleapis.com/auth/gmail.readonly' // Request Gmail scope
    //     }
    //   }
    // })
    // if (authError) throw authError

    // Simulate an error for UI testing
    // throw new Error('Failed to connect to Google. Please try again.')

  } catch (err) {
    console.error('Login failed:', err);
    error.value = err.message || 'An unexpected error occurred during login.';
  }
}
</script>

<style scoped>
.login-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh; /* Adjust as needed to center vertically */
  text-align: center;
  padding: var(--space-xl) var(--space-md);
}

.hero-section {
  max-width: 600px;
}

h1 {
  font-size: var(--font-3xl);
  font-weight: 700;
  margin-bottom: var(--space-md);
  color: var(--color-text);
}

.subheading {
  font-size: var(--font-lg);
  color: var(--color-muted);
  margin-bottom: var(--space-xl);
}

.login-button {
  /* Add specific styles if needed, e.g., width */
  padding: var(--space-md) var(--space-xl);
  font-size: var(--font-lg);
}

.login-button .icon-placeholder {
  /* Basic placeholder style - replace with actual icon */
  display: inline-block;
  width: 20px;
  height: 20px;
  line-height: 20px;
  text-align: center;
  margin-right: var(--space-sm);
  font-weight: bold;
  background-color: #eee;
  border-radius: 50%;
}

.error-message {
  margin-top: var(--space-lg);
  color: var(--color-error-text);
  background-color: var(--color-error-bg);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--border-radius-sm);
  display: inline-block; /* Prevent full width */
  /* Add slide-down animation if desired */
}
</style> 