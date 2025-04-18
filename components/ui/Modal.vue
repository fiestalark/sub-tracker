<template>
    <Teleport to="body">
      <transition
        enter-active-class="ease-out duration-300"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="ease-in duration-200"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div v-if="modelValue" class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity z-40" @click="$emit('update:modelValue', false)"></div>
      </transition>
  
      <transition
        enter-active-class="ease-out duration-300"
        enter-from-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        enter-to-class="opacity-100 translate-y-0 sm:scale-100"
        leave-active-class="ease-in duration-200"
        leave-from-class="opacity-100 translate-y-0 sm:scale-100"
        leave-to-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
      >
        <div v-if="modelValue" class="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
          <div class="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <span class="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>
            <div 
              class="relative inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle"
              @click.stop
            >
              <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div class="sm:flex sm:items-start">
                  <div class="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 class="text-lg font-medium leading-6 text-gray-900" id="modal-title">
                      {{ title }}
                    </h3>
                    <div class="mt-2">
                      <slot />
                    </div>
                  </div>
                </div>
              </div>
              <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <slot name="footer">
                  <Button 
                    variant="primary" 
                    class="sm:ml-3" 
                    @click="$emit('confirm')"
                  >
                    {{ confirmText }}
                  </Button>
                  <Button 
                    variant="secondary" 
                    class="mt-3 sm:mt-0" 
                    @click="$emit('update:modelValue', false)"
                  >
                    {{ cancelText }}
                  </Button>
                </slot>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
  </template>
  
  <script setup>
  import Button from './Button.vue';
  
  defineProps({
    modelValue: {
      type: Boolean,
      required: true
    },
    title: {
      type: String,
      default: 'Modal Title'
    },
    confirmText: {
      type: String,
      default: 'Confirm'
    },
    cancelText: {
      type: String,
      default: 'Cancel'
    }
  });
  
  defineEmits(['update:modelValue', 'confirm']);
  </script>