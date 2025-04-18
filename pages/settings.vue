<template>
    <div>
      <h1 class="text-2xl font-bold text-gray-900 mb-8">Settings</h1>
      
      <div class="space-y-8">
        <!-- Digest Frequency -->
        <Card>
          <template #header>
            <h2 class="text-lg font-medium text-gray-900">Digest Frequency</h2>
          </template>
          
          <div class="space-y-4">
            <p class="text-sm text-gray-500">
              Choose how often you want to receive subscription digests.
            </p>
            
            <div class="space-y-2">
              <div class="flex items-center">
                <input
                  id="weekly"
                  v-model="digestFrequency"
                  type="radio"
                  value="weekly"
                  class="h-4 w-4 text-accent-600 focus:ring-accent-500 border-gray-300"
                />
                <label for="weekly" class="ml-3 block text-sm font-medium text-gray-700">
                  Weekly
                </label>
              </div>
              
              <div class="flex items-center">
                <input
                  id="monthly"
                  v-model="digestFrequency"
                  type="radio"
                  value="monthly"
                  class="h-4 w-4 text-accent-600 focus:ring-accent-500 border-gray-300"
                />
                <label for="monthly" class="ml-3 block text-sm font-medium text-gray-700">
                  Monthly
                </label>
              </div>
            </div>
          </div>
          
          <template #footer>
            <Button 
              variant="primary" 
              size="sm" 
              :loading="savingDigestFrequency" 
              @click="saveDigestFrequency"
            >
              Save Preferences
            </Button>
          </template>
        </Card>
        
        <!-- Gmail Access -->
        <Card>
          <template #header>
            <h2 class="text-lg font-medium text-gray-900">Gmail Access</h2>
          </template>
          
          <div class="space-y-4">
            <p class="text-sm text-gray-500">
              SubscriptionTracker needs access to your Gmail to scan for subscription emails.
            </p>
            
            <div v-if="hasGmailAccess" class="bg-success-50 p-4 rounded-md">
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg class="h-5 w-5 text-success-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="ml-3">
                  <p class="text-sm font-medium text-success-800">
                    Gmail access granted
                  </p>
                  <p class="mt-1 text-sm text-success-700">
                    We have read-only access to scan your Gmail for subscription emails.
                  </p>
                </div>
              </div>
            </div>
            
            <div v-else class="bg-warning-50 p-4 rounded-md">
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg class="h-5 w-5 text-warning-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="ml-3">
                  <p class="text-sm font-medium text-warning-800">
                    Gmail access required
                  </p>
                  <p class="mt-1 text-sm text-warning-700">
                    We need access to your Gmail to scan for subscription emails.
                  </p>
                </div>
              </div>
              
              <div class="mt-4">
                <Button variant="secondary" size="sm" @click="grantGmailAccess">
                  Grant Access
                </Button>
              </div>
            </div>
          </div>
        </Card>
        
        <!-- Account -->
        <Card>
          <template #header>
            <h2 class="text-lg font-medium text-gray-900">Account</h2>
          </template>
          
          <div class="space-y-4">
            <div>
              <p class="text-sm font-medium text-gray-500">Email Address</p>
              <p class="mt-1">{{ user.email }}</p>
            </div>
            
            <Button variant="secondary" @click="signOut">
              Sign Out
            </Button>
          </div>
        </Card>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import Card from '../components/ui/Card.vue';
  import Button from '../components/ui/Button.vue';
  
  const router = useRouter();
  const digestFrequency = ref('monthly');
  const hasGmailAccess = ref(true);
  const savingDigestFrequency = ref(false);
  
  // Mock user data - in a real app, this would come from your auth store
  const user = ref({
    email: 'user@example.com',
    name: 'User'
  });
  
  const saveDigestFrequency = async () => {
    savingDigestFrequency.value = true;
    try {
      // In a real app, this would call your API
      console.log('Saving digest frequency:', digestFrequency.value);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (err) {
      console.error('Error saving digest frequency:', err);
    } finally {
      savingDigestFrequency.value = false;
    }
  };
  
  const grantGmailAccess = () => {
    // In a real app, this would redirect to OAuth flow
    console.log('Granting Gmail access...');
    hasGmailAccess.value = true;
  };
  
  const signOut = () => {
    // In a real app, this would call your auth service
    console.log('Signing out...');
    router.push('/login');
  };
  
  useHead({
    title: 'Settings'
  })
  </script>