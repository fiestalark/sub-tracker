import { useSupabaseUser, navigateTo } from '#imports'
import { watch } from 'vue'

export default defineNuxtRouteMiddleware(async (to) => {
  // Skip middleware on these pages
  if (to.path === '/login' || to.path === '/auth/callback') {
    return
  }

  const user = useSupabaseUser()

  // If we're on the client and the user state isn't determined yet
  if (import.meta.client && user.value === undefined) {
    await new Promise<void>((resolve) => {
      const unwatch = watch(user, (newUser) => {
        if (newUser !== undefined) {
          unwatch()
          resolve()
        }
      }, { immediate: true })

      // Failsafe timeout
      setTimeout(() => {
        unwatch()
        resolve()
      }, 3000)
    })
  }

  // After user state is resolved, handle navigation
  if (!user.value) {
    return navigateTo('/login')
  }
})