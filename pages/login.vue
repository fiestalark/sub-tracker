<template>
    <div class="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 class="text-center text-3xl font-extrabold text-gray-900">
          Track & Control Your Subscriptions
        </h1>
        <p class="mt-2 text-center text-sm text-gray-600">
          Connect your Gmail to see all your recurring payments in one place.
        </p>
      </div>
  
      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <ErrorBanner 
            v-if="error" 
            :message="error" 
            @dismiss="error = ''" 
          />
  
          <div class="flex flex-col items-center">
            <Button 
              @click="signInWithGoogle" 
              variant="secondary" 
              :loading="loading" 
              class="w-full flex justify-center"
            >
              <svg class="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Sign in with Google
            </Button>
  
            <p class="mt-4 text-xs text-gray-500 text-center">
              By signing in, you grant SubscriptionTracker read-only access to scan your Gmail for subscription emails.
            </p>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import Button from '../components/ui/Button.vue';
  import ErrorBanner from '../components/ui/ErrorBanner.vue';
  
  const router = useRouter();
  const loading = ref(false);
  const error = ref('');
  
  const signInWithGoogle = async () => {
    loading.value = true;
    try {
      // In a real app, this would call your OAuth service
      console.log('Signing in with Google...');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Redirect to callback
      router.push('/auth/callback');
    } catch (err) {
      console.error('Error signing in:', err);
      error.value = 'Failed to sign in with Google. Please try again.';
    } finally {
      loading.value = false;
    }
  };
  </script>