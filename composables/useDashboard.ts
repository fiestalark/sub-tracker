import { ref, watchEffect } from 'vue'
import { useSupabaseUser, useSupabaseClient } from '#imports'

export function useDashboard () {
  // STATE
  const user = useSupabaseUser()
  const supabase = useSupabaseClient() // Needed for API calls
  const isLoading = ref(false)
  const syncStatus = ref('')
  const subscriptions = ref([]) // Placeholder for subscription data
  const syncError = ref(false) // Keep track of error state

  // ACTIONS
  async function refreshEmails () {
    if (import.meta.server) return // Guard against server-side execution

    isLoading.value = true
    syncStatus.value = 'Starting email sync...'
    syncError.value = false

    try {
      console.log('Calling /api/gmail/sync endpoint...')
      const response = await $fetch('/api/gmail/sync', { // Use $fetch directly
        method: 'POST',
        // No body needed unless API requires it
      })

      console.log('Gmail Sync API Response:', response)
      // Assuming response has a count or similar field
      syncStatus.value = `Sync successful! Processed emails.` // Update message based on actual API response structure
      // TODO: Refetch subscriptions after successful sync
      await loadSubscriptions() // Example: reload subscriptions

    } catch (error) {
      console.error('Error calling Gmail Sync API:', error)
      const data = error?.data // Nuxt $fetch error data
      const message = data?.message || data?.statusMessage || error?.message || 'An unknown error occurred during sync.'
      syncStatus.value = `Sync failed: ${message}`
      syncError.value = true

    } finally {
      isLoading.value = false
      // Optional: Auto-hide status after delay
      // setTimeout(() => { syncStatus.value = null }, 7000)
    }
  }

  // Placeholder for loading subscriptions - implement based on your data source
  async function loadSubscriptions () {
    if (!user.value) return // Don't load if no user

    // isLoading.value = true // Optionally show loading state for subscriptions
    console.log('Placeholder: Loading subscriptions for user:', user.value.id)
    // Example: Fetch from Supabase table
    // const { data, error } = await supabase
    //   .from('subscriptions')
    //   .select('*')
    //   .eq('user_id', user.value.id);
    //
    // if (error) {
    //   console.error('Error loading subscriptions:', error)
    //   syncStatus.value = `Error loading subscriptions: ${error.message}`
    //   syncError.value = true
    // } else {
    //   subscriptions.value = data
    // }
    // isLoading.value = false // Reset loading state
    subscriptions.value = [ // TEMPORARY DUMMY DATA
      { id: 1, name: 'Netflix', cost: 15.99, next_renewal: '2024-10-30', category: 'Streaming' },
      { id: 2, name: 'Spotify', cost: 10.99, next_renewal: '2024-11-05', category: 'Music' },
      { id: 3, name: 'AWS', cost: 25.00, next_renewal: '2024-11-01', category: 'Cloud Services' }
    ]
  }

  // INIT: Load subscriptions when user context is available or changes
  watchEffect(() => {
    if (user.value) {
      loadSubscriptions()
    } else {
      // Reset state if user logs out
      subscriptions.value = []
      syncStatus.value = ''
      isLoading.value = false
    }
  })

  return {
    user,
    isLoading,
    syncStatus,
    syncError,
    subscriptions,
    refreshEmails,
    loadSubscriptions // Expose if needed elsewhere
  }
} 