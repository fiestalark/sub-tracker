<template>
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div v-if="$slots.header" class="px-4 py-5 sm:px-6 border-b border-gray-200">
        <slot name="header" />
      </div>
      <div class="px-4 py-5 sm:p-6">
        <slot />
      </div>
      <div v-if="$slots.footer" class="px-4 py-4 sm:px-6 bg-gray-50 border-t border-gray-200">
        <slot name="footer" />
      </div>
    </div>
  </template>