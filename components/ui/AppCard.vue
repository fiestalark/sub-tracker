<template>
  <div class="app-card">
    <div v-if="hasHeaderSlot || title" class="card-header">
      <slot name="header">
        <h3 v-if="title" class="card-title">{{ title }}</h3>
      </slot>
    </div>
    <div class="card-body">
      <slot />
    </div>
    <div v-if="hasFooterSlot" class="card-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup>
import { useSlots } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: null,
  },
})

const slots = useSlots()
const hasHeaderSlot = computed(() => !!slots.header)
const hasFooterSlot = computed(() => !!slots.footer)
</script>

<style scoped>
.app-card {
  background-color: var(--color-bg);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--color-border);
  box-shadow: var(--box-shadow);
  overflow: hidden; /* Ensures content respects border-radius */
  transition: box-shadow var(--transition-duration) var(--transition-timing);
}

/* Optional: Add hover effect */
/*
.app-card:hover {
  box-shadow: var(--box-shadow-md);
}
*/

.card-header {
  padding: var(--space-md) var(--space-lg);
  border-bottom: 1px solid var(--color-border);
  background-color: #f9fafb; /* Slightly off-white header */
}

.card-title {
  font-size: var(--font-lg);
  font-weight: 600;
  color: var(--color-text);
  margin: 0; /* Reset heading margin */
}

.card-body {
  padding: var(--space-lg);
}

.card-footer {
  padding: var(--space-md) var(--space-lg);
  border-top: 1px solid var(--color-border);
  background-color: #f9fafb; /* Slightly off-white footer */
  font-size: var(--font-sm);
  color: var(--color-muted);
}
</style> 