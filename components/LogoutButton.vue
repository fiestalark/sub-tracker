<template>
  <button
    @click="$emit('click')"
    class="px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
  >
    Logout
  </button>
</template>

<script setup>
defineEmits(['click'])
</script>

<style scoped>
/* Add any specific styles if needed */
</style> 