<template>
  <button
    @click="$emit('click')"
    class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
  >
    <!-- Placeholder for Google Icon -->
    <span class="mr-2">G</span>
    Sign in with Google
  </button>
</template>

<script setup>
defineEmits(['click'])
</script>

<style scoped>
/* Add any specific styles if needed */
</style> 