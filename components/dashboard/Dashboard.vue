<template>
  <div class="dashboard-page">
    <div class="dashboard-header">
      <h1>Your Subscription Dashboard</h1>
      <AppButton :disabled="isLoading" @click="refreshEmails">
        <span v-if="isLoading">
          <AppSpinner style="width: 1em; height: 1em; border-width: 2px; margin-right: var(--space-sm);"/> Refreshing...
        </span>
        <span v-else>
          Refresh Emails
        </span>
      </AppButton>
    </div>

    <!-- Sync Status Message -->
    <div v-if="syncStatus" class="sync-status-message" :class="{'success': !syncError, 'error': syncError}">
      {{ syncStatus }}
    </div>

    <!-- Removed initial load spinner - handled by parent index page -->

    <!-- Dashboard Grid -->
    <div class="dashboard-grid">
      <AppCard title="Spending Overview" class="overview-card">
        <!-- TODO: Replace with actual data from composable -->
        <p>Total Monthly Spend: <strong>$XXX.XX</strong></p>
        <p>Total Yearly Spend: <strong>$YYYY.YY</strong></p>
        <div class="placeholder-chart" aria-label="Placeholder for spending chart">Chart Area</div>
      </AppCard>

      <AppCard title="Upcoming Renewals" class="renewals-card">
        <!-- Use subscriptions data from composable -->
        <ul v-if="subscriptions.length">
          <li v-for="sub in subscriptions" :key="sub.id">
            {{ sub.vendor_name }} –
            <span v-if="sub.amount != null">
              ${{ Number(sub.amount).toFixed(2) }}
            </span>
            <span v-else>—</span>
            <span v-if="sub.next_renewal_date">
              "–Renews" {{ new Date(sub.next_renewal_date).toLocaleDateString() }}
            </span>
          </li>


        </ul>
        <p v-else>No upcoming renewals found.</p>
        <template #footer>
          <NuxtLink to="/subscriptions">View all subscriptions</NuxtLink>
        </template>
      </AppCard>

      <AppCard title="Category Breakdown" class="category-card">
        <!-- TODO: Replace with actual data from composable -->
        <ul>
          <li>Streaming: $XX.XX</li>
          <li>Music: $YY.YY</li>
          <li>Cloud Services: $ZZ.ZZ</li>
        </ul>
         <div class="placeholder-chart small" aria-label="Placeholder for category breakdown chart">Chart Area</div>
      </AppCard>

    </div>

    <!-- Placeholder/Empty state if needed -->
    <!-- <div v-if="!isLoading && !subscriptions.length" class="empty-state"> ... </div> -->

    <!-- Add the Unparsed List component below the grid -->
    <UnparsedList :unparsed="unparsedRef ?? []" />

  </div>
</template>

<script setup>
import { useDashboard } from '@/composables/useDashboard'
import AppButton from '~/components/ui/AppButton.vue'
import AppCard from '~/components/ui/AppCard.vue'
import AppSpinner from '~/components/ui/AppSpinner.vue'
import UnparsedList from '~/components/dashboard/UnparsedList.vue'

// Get state and actions from the composable
const { 
  subscriptions, 
  isLoading, 
  syncStatus, 
  syncError, 
  refreshEmails, 
  unparsed: unparsedRef // Add unparsed here
} = useDashboard()

// No need for user check here, parent `pages/index.vue` handles auth wall

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

.sync-status-message {
  margin-bottom: var(--space-lg);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-sm);
  text-align: center;
}

.sync-status-message.success {
  background-color: #dcfce7; /* Example Success */
  border: 1px solid #86efac;
  color: #166534;
}

.sync-status-message.error {
  background-color: #fee2e2; /* Example Error */
  border: 1px solid #fca5a5;
  color: #991b1b;
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
</style> 