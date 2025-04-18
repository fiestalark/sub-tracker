<template>
    <div>
      <label v-if="label" :for="id" class="block text-sm font-medium text-gray-700 mb-1">
        {{ label }}
      </label>
      <div class="relative rounded-md shadow-sm">
        <input
          :id="id"
          :type="type"
          :value="modelValue"
          @input="$emit('update:modelValue', $event.target.value)"
          :placeholder="placeholder"
          :disabled="disabled"
          :aria-invalid="!!error"
          :aria-describedby="error ? `${id}-error` : undefined"
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-accent-500 focus:ring-accent-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
          :class="{ 'border-error-300 focus:border-error-500 focus:ring-error-500': error }"
        />
      </div>
      <p v-if="error" :id="`${id}-error`" class="mt-2 text-sm text-error-600" role="alert">
        {{ error }}
      </p>
      <p v-if="helpText && !error" class="mt-2 text-sm text-gray-500">
        {{ helpText }}
      </p>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue';
  
  const props = defineProps({
    modelValue: {
      type: [String, Number],
      default: ''
    },
    label: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'text'
    },
    placeholder: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    error: {
      type: String,
      default: ''
    },
    helpText: {
      type: String,
      default: ''
    },
    id: {
      type: String,
      default: ''
    }
  });
  
  defineEmits(['update:modelValue']);
  
  const id = computed(() => props.id || `input-${Math.random().toString(36).substring(2, 9)}`);
  </script>