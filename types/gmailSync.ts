export interface GmailSyncResponse {
  processed: number
  updatedSubscriptions: number
  totals: { monthly: number; yearly: number }
  upcomingRenewals: Array<{
    vendor: string
    amount: number
    due: string // Assuming YYYY-MM-DD format
  }>
  categoryBreakdown: Array<{
    category: string
    total: number
  }>
  unparsed: Array<{
    subject: string
    sender: string
    date: string // Assuming ISO 8601 or similar date string
  }>
  moreAvailable: boolean
}

export interface GmailSyncError {
  error: 'revoked_or_expired'
} 