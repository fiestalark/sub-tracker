<template>
    <button
      :class="[
        'inline-flex items-center justify-center rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500',
        sizeClasses,
        variantClasses,
        disabled ? 'opacity-50 cursor-not-allowed' : '',
        className
      ]"
      :disabled="disabled || loading"
      v-bind="$attrs"
    >
      <Spinner v-if="loading" class="mr-2 h-4 w-4" />
      <slot />
    </button>
  </template>
  
  <script setup>
  import { computed } from 'vue';
  import Spinner from './Spinner.vue';
  
  const props = defineProps({
    variant: {
      type: String,
      default: 'primary',
      validator: (value) => ['primary', 'secondary', 'danger'].includes(value)
    },
    size: {
      type: String,
      default: 'md',
      validator: (value) => ['sm', 'md', 'lg'].includes(value)
    },
    loading: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    className: {
      type: String,
      default: ''
    }
  });
  
  const sizeClasses = computed(() => {
    switch (props.size) {
      case 'sm': return 'px-3 py-1.5 text-sm';
      case 'lg': return 'px-6 py-3 text-base';
      default: return 'px-4 py-2 text-sm';
    }
  });
  
  const variantClasses = computed(() => {
    switch (props.variant) {
      case 'primary': 
        return 'bg-accent-600 text-white hover:bg-accent-700 border border-transparent';
      case 'secondary': 
        return 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300';
      case 'danger': 
        return 'bg-error-600 text-white hover:bg-error-700 border border-transparent';
      default: 
        return 'bg-accent-600 text-white hover:bg-accent-700 border border-transparent';
    }
  });
  </script>