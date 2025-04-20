<template>
  <div>
    <!-- Render Dashboard if user is logged in -->
    <Dashboard v-if="user" />
    <!-- Render LandingHero if user is not logged in -->
    <LandingHero v-else />
  </div>
</template>

<script setup>
import { useSupabaseUser } from '#imports'
// Use Nuxt's auto-import for components unless paths are complex/ambiguous
// import Dashboard from '@/components/dashboard/Dashboard.vue' // Auto-imported usually
// import LandingHero from '@/components/landing/Hero.vue' // Assuming path, adjust if needed

// Define layout (optional, Nuxt might infer 'default')
definePageMeta({
  layout: 'default',
})

// Get the user state
const user = useSupabaseUser()

// No need for login/logout/refresh logic here, it's handled by:
// - useDashboard (refresh)
// - LandingHero (login)
// - LogoutButton in the layout/header (logout)
</script>

<style scoped>
/* Remove all previous scoped styles */
/* Add any page-specific wrapper styles if needed, but likely none required */
</style> 