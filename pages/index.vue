<template>
  <div v-if="showDashboard" class="dashboard-page">
    <div class="dashboard-header">
      <h1>Your Subscription Dashboard</h1>
      <AppButton @click="refreshEmails" :disabled="isLoading">
        <span v-if="isLoading">
          <AppSpinner style="width: 1em; height: 1em; border-width: 2px; margin-right: var(--space-sm);"/> Refreshing...
        </span>
        <span v-else>
          Refresh Emails
        </span>
      </AppButton>
    </div>

    <div v-if="isLoading" class="loading-overlay">
       <AppSpinner />
       <p>Loading your dashboard...</p>
    </div>

    <div v-else class="dashboard-grid">
      <AppCard title="Spending Overview" class="overview-card">
        <p>Total Monthly Spend: <strong>$XXX.XX</strong></p>
        <p>Total Yearly Spend: <strong>$YYYY.YY</strong></p>
        <div class="placeholder-chart" aria-label="Placeholder for spending chart">Chart Area</div>
      </AppCard>

      <AppCard title="Upcoming Renewals" class="renewals-card">
        <ul>
          <li>Netflix - $15.99 - Renews Oct 30</li>
          <li>Spotify - $10.99 - Renews Nov 5</li>
          <li>AWS - Est. $25.00 - Renews Nov 1</li>
        </ul>
        <template #footer>
          <NuxtLink to="/subscriptions">View all subscriptions</NuxtLink>
        </template>
      </AppCard>

      <AppCard title="Category Breakdown" class="category-card">
        <ul>
          <li>Streaming: $XX.XX</li>
          <li>Music: $YY.YY</li>
          <li>Cloud Services: $ZZ.ZZ</li>
        </ul>
         <div class="placeholder-chart small" aria-label="Placeholder for category breakdown chart">Chart Area</div>
      </AppCard>

    </div>

  </div>
  <div v-else class="landing-page">
    <section class="hero-section">
      <h1>Track Your Subscriptions Effortlessly</h1>
      <p>Never lose track of recurring payments again. Sign in to get started.</p>
      <AppButton @click="login" class="google-signin-button">
        <img src="/google-logo.svg" alt="Google logo" width="20" height="20" />
        Sign in with Google
      </AppButton>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useSupabaseUser, useSupabaseClient } from '#imports'
import AppButton from '~/components/ui/AppButton.vue' // Assuming button component path
import AppCard from '~/components/ui/AppCard.vue' // Assuming card component path
import AppSpinner from '~/components/ui/AppSpinner.vue' // Assuming spinner component path

definePageMeta({
  layout: 'default',
})

const router = useRouter()
const user = useSupabaseUser()
const supabase = useSupabaseClient()
const isLoading = ref(false)
const isInitialLoad = ref(true)

// Show dashboard only when signed in
const showDashboard = computed(() => !!user.value)

// Handle initial load
onMounted(async () => {
  if (showDashboard.value) {
    isLoading.value = true
    // Force a re-render after initial mount
    await nextTick()
    isInitialLoad.value = false
    isLoading.value = false
  }
})

// Modified login function with better error handling
const login = async () => {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        scopes: 'openid email profile https://www.googleapis.com/auth/gmail.readonly',
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    if (error) throw error
  } catch (error) {
    console.error('Error during Google sign-in:', error)
    // Add user-facing error handling if needed
  }
}

const refreshEmails = async () => {
  if (import.meta.server) return 
  isLoading.value = true
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    // Add actual refresh logic here
  } finally {
    isLoading.value = false
  }
}

// Add this to help with transition after auth
watch(user, async (newUser) => {
  if (newUser && isInitialLoad.value) {
    // Force a client-side navigation to ensure proper rendering
    await router.push('/dashboard')
  }
})
</script>

<style scoped>

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-xl);
  flex-wrap: wrap;
  gap: var(--space-md);
}

.dashboard-header h1 {
  font-size: var(--font-2xl);
  font-weight: 600;
  margin: 0;
}

.loading-overlay {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-2xl);
  min-height: 300px;
  color: var(--color-muted);
}
.loading-overlay p {
  margin-top: var(--space-md);
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-lg);
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

li {
  padding: var(--space-sm) 0;
  border-bottom: 1px solid var(--color-border);
}

li:last-child {
  border-bottom: none;
}

.renewals-card ul,
.category-card ul {
  margin-bottom: var(--space-md);
}

.renewals-card a {
  color: var(--color-accent);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.placeholder-chart {
  height: 150px;
  background-color: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-muted);
  border-radius: var(--border-radius-md);
  margin-top: var(--space-md);
  font-style: italic;
}

.placeholder-chart.small {
    height: 100px;
}

.empty-state {
  text-align: center;
  padding: var(--space-2xl);
  margin-top: var(--space-xl);
  border: 2px dashed var(--color-border);
  border-radius: var(--border-radius-lg);
}

.empty-illustration {
  max-width: 150px;
  margin: 0 auto var(--space-lg);
  opacity: 0.7;
}

.empty-state h2 {
  font-size: var(--font-xl);
  margin-bottom: var(--space-sm);
}

.empty-state p {
  color: var(--color-muted);
  margin-bottom: var(--space-lg);
}

/* Styles for the landing page / signed-out state */
.landing-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh; /* Adjust as needed */
  text-align: center;
}

.hero-section {
  max-width: 600px;
  padding: var(--space-xl);
}

.hero-section h1 {
  font-size: var(--font-3xl);
  font-weight: 700;
  margin-bottom: var(--space-md);
}

.hero-section p {
  font-size: var(--font-lg);
  color: var(--color-muted);
  margin-bottom: var(--space-lg);
}

.google-signin-button {
  /* Style the button as needed, potentially extending AppButton */
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-lg);
  font-weight: 500;
}

.google-signin-button img {
  display: block; /* Prevents extra space below image */
}
</style> 