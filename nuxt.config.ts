// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  css: [
    '~/assets/css/global.css', 
    '~/assets/css/layout.css',     
  ],
  runtimeConfig: {
    // Private keys are only available on the server
    // supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY,
    // Public keys that are exposed to the client, prefix with 'public'
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_KEY,
    }
  },

  modules: [
    '@nuxtjs/supabase',
    '@nuxt/eslint',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/scripts'
  ],

  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
    clientOptions: {
      auth: {
        flowType: 'pkce',          // generate verifier + challenge
        detectSessionInUrl: true,  // auto‑exchange on first paint
        persistSession: true,
      },
    },
    redirectOptions: {
      login: '/login',
      callback: '/auth/callback',
      exclude: [],
    }
  }
})