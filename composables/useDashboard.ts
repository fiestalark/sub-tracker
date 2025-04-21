import { ref, watchEffect } from 'vue'
import {
  useSupabaseClient,
  useSupabaseUser,
} from '#imports'
import type { SupabaseClient, PostgrestError } from '@supabase/supabase-js'
import type { GmailSyncResponse } from '@/types/gmailSync'
import { callFunction } from '@/utils/supabaseFunctions'

/* ------------------------------------------------------------------ */
/* local types                                                        */
/* ------------------------------------------------------------------ */

interface Subscription {
  id: string
  user_id: string
  vendor_name: string
  amount: number | null
  currency: string
  next_renewal_date: string | null
  email_date: string | null
  email_subject: string | null
  email_sender: string | null
  created_at: string
  updated_at: string
}


/* ------------------------------------------------------------------ */
/* composable                                                         */
/* ------------------------------------------------------------------ */

export function useDashboard() {
  const user            = useSupabaseUser()
  const supabase        = useSupabaseClient<SupabaseClient>()

  /* UI state */
  const isLoading       = ref(false)
  const syncStatus      = ref('')
  const syncError       = ref<string | false>(false)
  const needsReGrant    = ref(false)

  /* data */
  const subscriptions   = ref<Subscription[]>([])
  const totals          = ref<{ monthly: number; yearly: number } | null>(null)
  const upcoming        = ref<GmailSyncResponse['upcomingRenewals']>([])
  const categories      = ref<GmailSyncResponse['categoryBreakdown']>([])
  const unparsed        = ref<GmailSyncResponse['unparsed']>([])

  /* --------------------------- helpers --------------------------- */

  async function loadSubscriptions() {
    if (!user.value) return

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.value.id)
      .order('vendor_name') as {
        data: Subscription[] | null
        error: PostgrestError | null
      }

    if (error) {
      syncError.value  = error.message
      syncStatus.value = 'Error loading subscriptions'
      return
    }

    subscriptions.value = data ?? []
  }

  /* --------------------------- actions --------------------------- */

  async function refreshEmails() {
    if (import.meta.server) return
  
    isLoading.value = true
    syncStatus.value = 'Syncing emails…'
    syncError.value = false
    needsReGrant.value = false
  
    let data
    try {
      data = await callFunction('sync-gmail')
    } catch (err: unknown) {
      let msg = 'unknown_error'
      if (err instanceof Error) {
        msg = err.message
      }
      syncError.value = msg
  
      if (msg === 'revoked_or_expired' || msg === 'no_google_token') {
        needsReGrant.value = true
        syncStatus.value =
          'Google permission revoked or missing — please re‑grant access.'
      } else {
        syncStatus.value = `Sync failed: ${msg}`
      }
  
      isLoading.value = false
      return
    }
  
    totals.value = data.totals
    upcoming.value = data.upcomingRenewals
    categories.value = data.categoryBreakdown
    unparsed.value = data.unparsed
    syncStatus.value =
      `Processed ${data.processed} email${data.processed === 1 ? '' : 's'}` +
      (data.moreAvailable ? ' — click again to fetch more.' : '')
  
    await loadSubscriptions()
    isLoading.value = false
  }
  

  /* ---------------------- auto init / reset ---------------------- */

  watchEffect(() => {
    if (user.value) {
      loadSubscriptions()
    } else {
      subscriptions.value = []
      totals.value        = null
      upcoming.value      = []
      categories.value    = []
      unparsed.value      = []
      syncStatus.value    = ''
      syncError.value     = false
      needsReGrant.value  = false
    }
  })

  return {
    /* state */
    user,
    isLoading,
    syncStatus,
    syncError,
    needsReGrant,
    /* data */
    subscriptions,
    totals,
    upcoming,
    categories,
    unparsed,
    /* actions */
    refreshEmails,
    loadSubscriptions,
  }
}
