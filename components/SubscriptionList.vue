<template>
    <div>
      <h2 class="text-lg font-medium text-gray-900 mb-4">Your Subscriptions</h2>
      
      <div v-if="loading" class="space-y-4">
        <div v-for="i in 3" :key="i" class="animate-pulse flex items-center p-4 bg-white rounded-lg shadow">
          <div class="rounded-full bg-gray-200 h-12 w-12"></div>
          <div class="ml-4 flex-1">
            <div class="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div class="h-3 bg-gray-200 rounded w-1/3"></div>
          </div>
          <div class="h-4 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
      
      <div v-else-if="subscriptions.length === 0" class="text-center py-12 bg-white rounded-lg shadow">
        <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No subscriptions found</h3>
        <p class="mt-1 text-sm text-gray-500">Click Refresh to scan your Gmail for subscriptions.</p>
        <div class="mt-6">
          <Button @click="$emit('refresh')">
            Refresh Emails
          </Button>
        </div>
      </div>
      
      <div v-else class="space-y-4">
        <div 
          v-for="subscription in subscriptions" 
          :key="subscription.id" 
          class="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <div class="flex-shrink-0 h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 overflow-hidden">
            <img 
              v-if="subscription.logoUrl" 
              :src="subscription.logoUrl" 
              :alt="`${subscription.vendor} logo`" 
              class="h-full w-full object-cover"
            />
            <span v-else class="text-lg font-bold">{{ subscription.vendor.charAt(0) }}</span>
          </div>
          
          <div class="ml-4 flex-1">
            <h3 class="text-sm font-medium text-gray-900">{{ subscription.vendor }}</h3>
            <p class="text-sm text-gray-500">{{ formatCurrency(subscription.amount) }} / {{ subscription.cycle }}</p>
          </div>
          
          <div class="ml-4 text-right">
            <p class="text-sm font-medium" :class="getRenewalClass(subscription.daysUntilRenewal)">
              Renews {{ formatRenewalDate(subscription.nextRenewalDate) }}
            </p>
            <p class="text-xs text-gray-500">
              {{ formatDaysUntilRenewal(subscription.daysUntilRenewal) }}
            </p>
          </div>
          
          <button 
            @click="$emit('ignore', subscription.id)" 
            class="ml-4 text-gray-400 hover:text-error-500 focus:outline-none"
            aria-label="Ignore subscription"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import Button from './ui/Button.vue';
  
  defineProps({
    subscriptions: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    }
  });
  
  defineEmits(['refresh', 'ignore']);
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  const formatRenewalDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };
  
  const formatDaysUntilRenewal = (days) => {
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    return `in ${days} days`;
  };
  
  const getRenewalClass = (days) => {
    if (days <= 3) return 'text-error-600';
    if (days <= 7) return 'text-warning-600';
    return 'text-gray-700';
  };
  </script>