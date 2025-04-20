<template>
  <div class="flex flex-col items-center justify-center min-h-screen">
    <div v-if="loading" class="text-center">
      <p>Completing sign-in...</p>
      <!-- Basic Spinner Placeholder -->
    </div>
    <div v-else-if="errorMessage">
      <ErrorBanner :message="errorMessage" class="mb-4" />
      <NuxtLink to="/login" class="text-indigo-600 hover:text-indigo-800">
        Retry Login
      </NuxtLink>
    </div>
    <div v-else>
      <p>Redirecting...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router' // Use vue-router directly or Nuxt's useRouter
// import { useSupabaseClient } from '#supabase/client' // Removed - rely on auto-import

// Assuming useSupabaseClient composable is available
const router = useRouter() // Or useNuxtApp().$router in some Nuxt contexts

const loading = ref(true)
const errorMessage = ref('')

onMounted(async () => {
  // Supabase client should automatically handle the session
  // when initialized, especially with the Nuxt module.
  // We might not need getSessionFromUrl explicitly if using nuxt/supabase
  // Let's watch the auth state instead for robustness

  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    // Unsubscribe after first event or navigation
    if (subscription) {
      subscription.unsubscribe()
    }

    if (event === 'SIGNED_IN' && session) {
      // Successfully signed in
      loading.value = false
      router.push('/dashboard')
    } else if (event === 'SIGNED_OUT') {
      // Handle potential sign-out during callback?
      loading.value = false
      errorMessage.value = 'Session ended unexpectedly. Please try logging in again.'
      router.push('/login') // Redirect to login if sign out happens
    } else if (event === 'INITIAL_SESSION') {
       // If a session already exists when page loads
       if (session) {
          loading.value = false
          router.push('/dashboard')
       } else {
         // If no session, maybe there was an error in the URL hash
         // Let's explicitly try getSessionFromUrl as a fallback or primary method
         // If the watcher doesn't fire SIGNED_IN quickly.
         // This part depends heavily on how @nuxtjs/supabase handles the flow.
         // For now, keep it simple assuming the watcher works.
         // If issues arise, we might need getSessionFromUrl().
         // Consider adding a timeout? If SIGNED_IN doesn't fire after ~5s, show error.
         loading.value = false;
         errorMessage.value = 'Failed to process authentication callback. Please retry.';
       }
    } else if (event === 'AUTH_CODE_ERROR') {
      // Handle specific OAuth errors if possible
      loading.value = false;
      errorMessage.value = 'There was an error during authentication. Please retry.';
    }
    // Other events like TOKEN_REFRESHED, USER_UPDATED might occur
  });

  // Timeout fallback in case onAuthStateChange doesn't fire as expected
  setTimeout(() => {
    if (loading.value) {
      loading.value = false;
      errorMessage.value = 'Authentication timed out. Please try again.';
      // Consider explicitly calling getSession to double-check
      // const { data: { session } } = await supabase.auth.getSession()
      // if (session) router.push('/dashboard')
    }
  }, 10000); // 10 second timeout

});

// Optional: Define layout
// definePageMeta({ layout: 'minimal' });
</script>

<style scoped>
/* Add any specific styles if needed */
</style> 