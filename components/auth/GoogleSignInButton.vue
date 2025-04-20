<template>
  <button
    @click="$emit('click')"
    class="google-signin-button"
  >
    <!-- Placeholder for Google Icon -->
    <span class="google-icon">G</span>
    Sign in with Google
  </button>
</template>

<script setup>
defineEmits(['click'])
</script>

<style scoped>
.google-signin-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-sm) var(--space-lg);
  border: 1px solid transparent;
  font-size: var(--font-sm);
  font-weight: 500;
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-sm);
  color: var(--color-primary-button-text);
  background-color: var(--color-primary);
  cursor: pointer;
  transition: background-color 0.2s ease, box-shadow 0.2s ease;
}

.google-signin-button:hover {
  background-color: var(--color-primary-dark);
}

.google-signin-button:focus {
  outline: none;
  box-shadow: 0 0 0 2px var(--color-background), 0 0 0 4px var(--color-primary);
}

.google-icon {
  margin-right: var(--space-sm);
  font-weight: bold;
}
</style> 