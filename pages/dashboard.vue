<template>
  <div>
    <!-- Header -->
    <header class="flex justify-between items-center p-4 border-b">
      <div v-if="user" class="flex items-center">
        <!-- Placeholder for Avatar -->
        <div class="w-8 h-8 rounded-full bg-gray-300 mr-3"></div>
        <span>{{ user.email }}</span>
      </div>
      <LogoutButton @click="handleLogout" />
    </header>

    <!-- Main Content -->
    <main class="p-6">
      <h1 class="text-2xl font-semibold mb-4">Dashboard</h1>

      <!-- Placeholder for Scope Notice -->
      <!-- <ScopeNotice v-if="needsGmailScope" /> -->

      <div class="mb-6">
        <!-- Placeholder for SubscriptionSummary -->
        <div class="bg-gray-100 p-4 rounded shadow">
          <h2 class="font-bold mb-2">Subscription Summary</h2>
          <p>Total Spend: $XXX.XX</p>
          <p>Upcoming Renewals: X</p>
        </div>
      </div>

      <div class="mb-6">
         <!-- Placeholder for SubscriptionList -->
         <div class="bg-gray-100 p-4 rounded shadow">
            <h2 class="font-bold mb-2">Subscription List</h2>
            <ul>
                <li>Vendor A - $10.00 - Renews 2024-08-01</li>
                <li>Vendor B - $15.00 - Renews 2024-08-15</li>
            </ul>
         </div>
      </div>

      <div>
        <button
           class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
           @click="handleRefreshEmails"
         >
           Refresh Emails
         </button>
         <!-- Add loading/success/error state for refresh -->
      </div>

    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
// import { useSupabaseClient, useSupabaseUser } from '#supabase/client' // Removed - rely on auto-import

// Composables for Supabase and user state

// Placeholder state for Gmail scope check
// const needsGmailScope = ref(false);

// Check user authentication state on mount
onMounted(() => {
  // Redirect to login if user is not authenticated
  // This might be handled globally by middleware as well
  watchEffect(() => {
      if (!user.value) {
          router.push('/login')
      }
  })

  // Placeholder: Check if current session has gmail.readonly scope
  // checkGmailScope();
});

// async function checkGmailScope() {
//   const { data: { session }, error } = await supabase.auth.getSession();
//   if (session && session.provider_token) {
//     // A simple check (might be insufficient) - ideally check decoded JWT or user metadata
//     // This requires a more robust check, potentially involving server-side verification
//     // or parsing the access token claims if available client-side (not recommended for security).
//     // Supabase helper functions or custom logic might be needed.
//     // For now, assume scope is granted if provider_token exists, which is NOT accurate.
//     console.log('Provider token exists, assuming scope granted for now.');
//     needsGmailScope.value = false; 
//   } else {
//     console.warn('Provider token missing or session error:', error);
//     needsGmailScope.value = true;
//   }
// }

async function handleLogout() {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('Error logging out:', error)
    // Optionally show an error message to the user
  } else {
    // Redirect handled by auth state watcher or middleware
     router.push('/login'); // Explicit redirect just in case
  }
}

function handleRefreshEmails() {
  console.log('Refresh Emails button clicked - Implement manual trigger logic here');
  // This should likely call a backend endpoint (e.g., Edge Function trigger)
  // e.g., await $fetch('/api/gmail/sync', { method: 'POST' })
}

// Use default layout or specify another one
// definePageMeta({ layout: 'default' });
</script>

<style scoped>
/* Add component-specific styles */
</style> 