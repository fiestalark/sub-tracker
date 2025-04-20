<template>
  <div>
    <!-- Header -->
    <header class="dashboard-header">
      <div v-if="user" class="user-info">
        <!-- Placeholder for Avatar -->
        <div class="avatar-placeholder"></div>
        <span>{{ user.email }}</span>
      </div>
      <LogoutButton @click="handleLogout" />
    </header>

    <!-- Main Content -->
    <main class="dashboard-main">
      <h1 class="dashboard-title">Dashboard</h1>

      <!-- Placeholder for Scope Notice -->
      <!-- <ScopeNotice v-if="needsGmailScope" /> -->

      <div class="summary-section">
        <!-- Placeholder for SubscriptionSummary -->
        <div class="summary-card">
          <h2 class="summary-title">Subscription Summary</h2>
          <p>Total Spend: $XXX.XX</p>
          <p>Upcoming Renewals: X</p>
        </div>
      </div>

      <div class="list-section">
         <!-- Placeholder for SubscriptionList -->
         <div class="list-card">
            <h2 class="list-title">Subscription List</h2>
            <ul>
                <li>Vendor A - $10.00 - Renews 2024-08-01</li>
                <li>Vendor B - $15.00 - Renews 2024-08-15</li>
            </ul>
         </div>
      </div>

      <div>
        <button
           class="refresh-button"
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
import { onMounted, watchEffect } from 'vue'
import { useSupabaseClient } from '#imports'


const supabase = useSupabaseClient()
const user = useSupabaseUser()
// Composables for Supabase and user state

// Placeholder state for Gmail scope check
// const needsGmailScope = ref(false);

// Check user authentication state on mount
onMounted(() => {
  // Redirect to login if user is not authenticated
  // This might be handled globally by middleware as well
  watchEffect(() => {
      if (!user.value) {
          navigateTo('/login')
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
    navigateTo('/login');
  }
}

function handleRefreshEmails() {
  if (import.meta.server) return 
  console.log('Refresh Emails button clicked - Implement manual trigger logic here');
  // This should likely call a backend endpoint (e.g., Edge Function trigger)
  // e.g., await $fetch('/api/gmail/sync', { method: 'POST' })
}

// Use default layout or specify another one
// definePageMeta({ layout: 'default' });
</script>

<style scoped>
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-lg);
  border-bottom: 1px solid var(--color-border);
}

.user-info {
  display: flex;
  align-items: center;
}

.avatar-placeholder {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background-color: var(--color-surface-muted);
  margin-right: var(--space-md);
}

.dashboard-main {
  padding: var(--space-xl);
}

.dashboard-title {
  font-size: var(--font-2xl);
  font-weight: 600;
  margin-bottom: var(--space-lg);
}

.summary-section,
.list-section {
  margin-bottom: var(--space-xl);
}

.summary-card,
.list-card {
  background-color: var(--color-surface);
  padding: var(--space-lg);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
}

.summary-title,
.list-title {
  font-weight: bold;
  margin-bottom: var(--space-sm);
}

.list-card ul {
  list-style: none;
  padding: 0;
}

.list-card li {
  margin-bottom: var(--space-xs);
}

.refresh-button {
  padding: var(--space-sm) var(--space-lg);
  background-color: var(--color-primary);
  color: var(--color-button-text);
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.refresh-button:hover {
  background-color: var(--color-primary-dark);
}
</style> 