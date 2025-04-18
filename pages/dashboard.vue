<template>
    <div>
      <div class="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p class="mt-1 text-sm text-gray-500">
            Track and manage all your subscriptions in one place.
          </p>
        </div>
        
        <div class="mt-4 md:mt-0 flex items-center">
          <div class="mr-6 text-right">
            <p class="text-sm text-gray-500">Total Monthly Spend</p>
            <p class="text-2xl font-bold text-gray-900">{{ formatCurrency(totalMonthlySpend) }}</p>
          </div>
          
          <Button @click="refreshSubscriptions" :loading="loading">
            Refresh Emails
          </Button>
        </div>
      </div>
      
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <!-- Spending Overview Card -->
        <Card class="lg:col-span-4">
          <template #header>
            <h2 class="text-lg font-medium text-gray-900">Spending Overview</h2>
          </template>
          
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">Monthly Total</p>
              <p class="text-2xl font-bold text-gray-900">{{ formatCurrency(totalMonthlySpend) }}</p>
            </div>
            
            <div class="text-right">
              <p class="text-sm text-gray-500">vs. Last Month</p>
              <p 
                class="text-lg font-semibold" 
                :class="percentChange >= 0 ? 'text-error-600' : 'text-success-600'"
              >
                {{ percentChange >= 0 ? '+' : '' }}{{ percentChange }}%
              </p>
            </div>
          </div>
        </Card>
        
        <!-- Category Breakdown Chart -->
        <Card class="lg:col-span-8">
          <template #header>
            <h2 class="text-lg font-medium text-gray-900">Category Breakdown</h2>
          </template>
          
          <div class="h-64 flex items-center justify-center">
            <!-- In a real app, this would be a chart component -->
            <div class="text-center text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p class="mt-2">Category breakdown chart</p>
            </div>
          </div>
        </Card>
        
        <!-- Upcoming Renewals -->
        <div class="lg:col-span-12">
          <SubscriptionList 
            :subscriptions="subscriptions" 
            :loading="loading" 
            @refresh="refreshSubscriptions"
            @ignore="ignoreSubscription"
          />
        </div>
      </div>
      
      <!-- Digest Preview Modal -->
      <div class="mt-8 text-center">
        <Button variant="secondary" @click="showDigestModal = true">
          Preview Digest
        </Button>
      </div>
      
      <Modal 
        v-model="showDigestModal" 
        title="Monthly Subscription Digest" 
        confirm-text="Send Now"
        @confirm="sendDigest"
      >
        <div class="space-y-4">
          <div class="bg-gray-50 p-4 rounded-md">
            <h3 class="font-medium text-gray-900">Summary</h3>
            <p class="mt-1 text-sm text-gray-500">
              You're spending {{ formatCurrency(totalMonthlySpend) }} per month on {{ subscriptions.length }} subscriptions.
            </p>
          </div>
          
          <div>
            <h3 class="font-medium text-gray-900 mb-2">Top Subscriptions</h3>
            <ul class="space-y-2">
              <li v-for="sub in topSubscriptions" :key="sub.id" class="flex justify-between text-sm">
                <span>{{ sub.vendor }}</span>
                <span class="font-medium">{{ formatCurrency(sub.amount) }}</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 class="font-medium text-gray-900 mb-2">Upcoming Renewals</h3>
            <ul class="space-y-2">
              <li v-for="sub in upcomingRenewals" :key="sub.id" class="flex justify-between text-sm">
                <span>{{ sub.vendor }}</span>
                <span>{{ formatRenewalDate(sub.nextRenewalDate) }}</span>
              </li>
            </ul>
          </div>
        </div>
      </Modal>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue';
  import Card from '../components/ui/Card.vue';
  import Button from '../components/ui/Button.vue';
  import Modal from '../components/ui/Modal.vue';
  import SubscriptionList from '../components/SubscriptionList.vue';
  
  // Mock data - in a real app, this would come from your API
  const subscriptions = ref([
    {
      id: 1,
      vendor: 'Netflix',
      amount: 15.99,
      cycle: 'month',
      nextRenewalDate: '2025-05-15',
      daysUntilRenewal: 2,
      category: 'Entertainment',
      logoUrl: null
    },
    {
      id: 2,
      vendor: 'Spotify',
      amount: 9.99,
      cycle: 'month',
      nextRenewalDate: '2025-05-20',
      daysUntilRenewal: 7,
      category: 'Entertainment',
      logoUrl: null
    },
    {
      id: 3,
      vendor: 'Adobe Creative Cloud',
      amount: 52.99,
      cycle: 'month',
      nextRenewalDate: '2025-06-01',
      daysUntilRenewal: 19,
      category: 'Productivity',
      logoUrl: null
    },
    {
      id: 4,
      vendor: 'Amazon Prime',
      amount: 12.99,
      cycle: 'month',
      nextRenewalDate: '2025-05-25',
      daysUntilRenewal: 12,
      category: 'Shopping',
      logoUrl: null
    }
  ]);
  
  const loading = ref(false);
  const showDigestModal = ref(false);
  const percentChange = ref(-5); // Mock data
  
  const totalMonthlySpend = computed(() => {
    return subscriptions.value.reduce((total, sub) => total + sub.amount, 0);
  });
  
  const topSubscriptions = computed(() => {
    return [...subscriptions.value]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);
  });
  
  const upcomingRenewals = computed(() => {
    return [...subscriptions.value]
      .sort((a, b) => a.daysUntilRenewal - b.daysUntilRenewal)
      .slice(0, 3);
  });
  
  const refreshSubscriptions = async () => {
    loading.value = true;
    try {
      // In a real app, this would call your API
      console.log('Refreshing subscriptions...');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real app, this would update the subscriptions state
    } catch (err) {
      console.error('Error refreshing subscriptions:', err);
    } finally {
      loading.value = false;
    }
  };
  
  const ignoreSubscription = (id) => {
    subscriptions.value = subscriptions.value.filter(sub => sub.id !== id);
  };
  
  const sendDigest = async () => {
    try {
      // In a real app, this would call your API
      console.log('Sending digest...');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showDigestModal.value = false;
    } catch (err) {
      console.error('Error sending digest:', err);
    }
  };
  
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
  
  onMounted(() => {
    // In a real app, this would fetch initial data
  });
  </script>