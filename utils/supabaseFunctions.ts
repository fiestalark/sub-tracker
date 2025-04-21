import { useSupabaseClient } from '#imports'

export async function callFunction(
  name: string,
  options?: Record<string, any>
) {
  const supabase = useSupabaseClient()
  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (!session) throw new Error('not_logged_in')

  const headers: Record<string, string> = {
    Authorization: `Bearer ${session.access_token}`
  }
  if (session.provider_token) {
    headers['x-provider-token'] = session.provider_token
  }

  const { data, error } = await supabase.functions.invoke(name, {
    body: options,
    headers
  })

  if (error) {
    const raw = error.context?.responseText
    const parsed = raw ? JSON.parse(raw) : {}
    const code = parsed.error || error.message

    if (code === 'revoked_or_expired' || code === 'no_google_token') {
      const e = new Error(code)
      e.name = 'FunctionError'
      throw e
    }
    throw new Error(`edge_fn_${code}`)
  }

  return data
}
