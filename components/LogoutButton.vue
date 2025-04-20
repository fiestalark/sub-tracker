<template>
  <button
    @click="$emit('click')"
    class="logout-button"
  >
    Logout
  </button>
</template>

<script setup>
defineEmits(['click'])
</script>

<style scoped>
.logout-button {
  padding: 0.25rem 0.75rem; /* Approximates px-3 py-1 */
  border: 1px solid var(--color-border); /* Replaces border border-gray-300 */
  font-size: var(--font-sm); /* Replaces text-sm */
  font-weight: 500; /* Replaces font-medium */
  border-radius: var(--border-radius-md); /* Replaces rounded-md */
  color: var(--color-text-secondary); /* Replaces text-gray-700 */
  background-color: var(--color-button-secondary-bg); /* Replaces bg-white */
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.logout-button:hover {
  background-color: var(--color-surface-hover); /* Replaces hover:bg-gray-50 */
}

.logout-button:focus {
  outline: none; /* Replaces focus:outline-none */
  box-shadow: 0 0 0 2px var(--color-background), 0 0 0 4px var(--color-primary); /* Replaces focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 */
}
</style> 