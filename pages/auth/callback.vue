<template>
  <div class="callback-container">
    <!-- 1. still-loading state -->
    <div v-if="loading" class="loading-state">
      <p>Completing sign‑in…</p>
    </div>

    <!-- 2. error state -->
    <div v-else-if="errorMessage" class="error-state">
      <ErrorBanner :message="errorMessage" class="error-banner-spacing" />
      <NuxtLink to="/login" class="retry-link">
        Retry Login
      </NuxtLink>
    </div>

    <!-- 3. success: instant redirect -->
    <div v-else>
      <p>Redirecting…</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useSupabaseUser, navigateTo } from '#imports'          // no client needed now
import ErrorBanner from '~/components/ui/ErrorBanner.vue'

const route        = useRoute()
const user         = useSupabaseUser()

const loading      = ref(true)
const errorMessage = ref('')

/**
 * 1. If the module put ?error_description=… in the callback URL
 *    surface it and stop loading.
 */
onMounted(() => {
  const err = route.query.error_description as string | undefined
  if (err) {
    errorMessage.value = decodeURIComponent(err.replace(/\+/g, ' '))
    loading.value      = false
  }
})

/**
 * 2. When the automatic PKCE exchange finishes successfully,
 *    `useSupabaseUser()` becomes non‑null → redirect.
 */
watchEffect(async () => {
  if (user.value) {
    await navigateTo('/dashboard')   // also strips ?code=… from the URL
  }
  // when we land here without user AND without errorMessage
  // we're still waiting → keep the "loading" state
  if (!user.value && !errorMessage.value) loading.value = true
})
</script>

<style scoped>
.callback-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh; /* Replaces min-h-screen */
}

.loading-state,
.error-state {
  text-align: center; /* Replaces text-center */
}

.error-banner-spacing {
  margin-bottom: var(--space-lg); /* Replaces mb-4 */
}

.retry-link {
  color: var(--color-primary); /* Replaces text-indigo-600 */
  text-decoration: none;
}

.retry-link:hover {
  color: var(--color-primary-dark); /* Replaces hover:text-indigo-800, assuming a darker primary */
  text-decoration: underline;
}
</style> 