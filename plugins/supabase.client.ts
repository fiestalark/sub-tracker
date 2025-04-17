import { createClient } from '@supabase/supabase-js'

export default defineNuxtPlugin(nuxtApp => {
  const config = useRuntimeConfig()

  const supabaseUrl = config.public.supabaseUrl
  const supabaseKey = config.public.supabaseKey

  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase URL or Key is missing. Make sure SUPABASE_URL and SUPABASE_KEY are set in your .env file and exposed in nuxt.config.ts')
    // Optionally handle the error, e.g., redirect to an error page or show a notification
    return
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  // Make the Supabase client available globally in the Nuxt app
  // You can access it via nuxtApp.$supabase or useSupabaseClient() composable (if you create one)
  nuxtApp.provide('supabase', supabase)

  console.log('Supabase client initialized')
}) 