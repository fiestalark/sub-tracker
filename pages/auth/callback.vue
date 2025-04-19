<template>
  <div class="callback-page">
    <AppSpinner />
    <p class="message">Signing you in securely...</p>
  </div>
</template>

<script setup>
// No layout needed for this full-screen loading page
definePageMeta({
  layout: false
})

onMounted(() => {
  // Placeholder: Implement the logic to handle the OAuth callback here.
  // This usually involves exchanging the code/token received from the provider.
  console.log('OAuth callback page mounted. Handle token exchange and redirect.');

  // Example: After successful handling, redirect to dashboard
  // const router = useRouter()
  // setTimeout(() => {
  //   router.push('/') // Redirect to dashboard
  // }, 2000) // Simulate processing time
})
</script>

<style scoped>
.callback-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100vw;
  background-color: var(--color-bg);
}

.message {
  margin-top: var(--space-lg);
  font-size: var(--font-lg);
  color: var(--color-muted);
}
</style> 