<template>
    <div class="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div class="text-center">
        <Spinner size="lg" class="mx-auto mb-4" />
        <h2 class="text-xl font-medium text-gray-900 mb-2">Signing you in...</h2>
        
        <div v-if="error" class="mt-4">
          <p class="text-error-600 mb-4">{{ error }}</p>
          <Button @click="retry">Retry</Button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import Spinner from '../../components/ui/Spinner.vue';
  import Button from '../../components/ui/Button.vue';
  
  const router = useRouter();
  const error = ref('');
  
  const processAuth = async () => {
    try {
      // In a real app, this would process the OAuth callback
      console.log('Processing authentication callback...');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Redirect to dashboard on success
      router.push('/dashboard');
    } catch (err) {
      console.error('Error processing auth:', err);
      error.value = 'Authentication failed. Please try again.';
    }
  };
  
  const retry = () => {
    error.value = '';
    processAuth();
  };
  
  onMounted(() => {
    processAuth();
  });
  </script>