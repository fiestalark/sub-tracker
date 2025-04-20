<template>
  <div
    v-if="message"
    class="error-banner"
    role="alert"
  >
    <strong class="error-title">Error:</strong>
    <span class="error-message">{{ message }}</span>
  </div>
</template>

<script setup>
defineProps({
  message: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
.error-banner {
  background-color: var(--color-error-bg);
  border: 1px solid var(--color-error-border);
  color: var(--color-error-text);
  padding: var(--space-md) var(--space-lg);
  border-radius: var(--border-radius);
  position: relative;
}

.error-title {
  font-weight: bold;
  margin-right: var(--space-sm);
}

.error-message {
  display: inline-block;
}

/* Example media query if sm:inline behavior was crucial */
/* @media (min-width: 640px) { 
  .error-message {
    display: inline;
  }
} */
</style> 