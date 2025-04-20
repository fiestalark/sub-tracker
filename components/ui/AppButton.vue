<template>
  <button class="app-button" :class="variantClass">
    <slot />
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary', // e.g., primary, secondary, danger, ghost
  },
})

const variantClass = computed(() => {
  return `button-${props.variant}`;
})
</script>

<style scoped>
.app-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-sm) var(--space-lg);
  border-radius: var(--border-radius-md);
  border: 1px solid transparent;
  font-weight: 500;
  font-size: var(--font-base);
  cursor: pointer;
  transition-property: background-color, border-color, color, box-shadow;
  transition-duration: var(--transition-duration);
  transition-timing-function: var(--transition-timing);
  white-space: nowrap;
  user-select: none;
  text-decoration: none; /* For links styled as buttons */
}

/* Primary Button (Default) */
.button-primary {
  background-color: var(--color-accent);
  color: var(--color-bg);
  border-color: var(--color-accent);
}

.button-primary:hover {
  background-color: var(--color-accent-hover);
  border-color: var(--color-accent-hover);
}

.button-primary:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

/* Secondary Button */
.button-secondary {
  background-color: var(--color-bg);
  color: var(--color-accent);
  border-color: var(--color-accent);
}

.button-secondary:hover {
  background-color: #f0f0ff; /* Lighter accent shade */
}

.button-secondary:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

/* Ghost Button */
.button-ghost {
  background-color: transparent;
  color: var(--color-accent);
  border-color: transparent;
}

.button-ghost:hover {
  background-color: #f0f0ff; /* Lighter accent shade */
}

.button-ghost:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

/* Danger Button (Example) */
.button-danger {
  background-color: var(--color-error-text);
  color: var(--color-bg);
  border-color: var(--color-error-text);
}

.button-danger:hover {
  background-color: #991b1b; /* Darker error color */
  border-color: #991b1b;
}

.button-danger:focus-visible {
  outline: 2px solid var(--color-error-text);
  outline-offset: 2px;
}

/* Add styles for :active, :disabled states as needed */
.app-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style> 