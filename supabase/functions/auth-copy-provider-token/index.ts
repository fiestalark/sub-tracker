import { serve } from 'https://deno.land/std@0.192.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

serve(async (req) => {
  const payload = await req.json()       // comes from GoTrue
  const user    = payload.event.data.new // after_sign_in and after_token_refresh

  const token = user?.provider_token
  if (!token) return new Response('no token', { status: 200 })

  await supabase.from('users').upsert({
    id: user.id,
    provider_token: token,
    needs_regrant: false
  })

  return new Response('ok', { status: 200 })
})
