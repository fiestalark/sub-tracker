<template>
    <div class="flex flex-col min-h-screen">
      <header class="bg-white shadow-sm fixed top-0 left-0 right-0 z-10">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex items-center">
              <NuxtLink to="/dashboard" class="text-accent-600 font-bold text-xl">
                SubscriptionTracker
              </NuxtLink>
              <nav class="hidden md:ml-8 md:flex md:space-x-8">
                <NuxtLink 
                  to="/dashboard" 
                  class="text-gray-700 hover:text-accent-600 px-3 py-2 text-sm font-medium"
                  active-class="text-accent-600 border-b-2 border-accent-600"
                >
                  Dashboard
                </NuxtLink>
                <NuxtLink 
                  to="/settings" 
                  class="text-gray-700 hover:text-accent-600 px-3 py-2 text-sm font-medium"
                  active-class="text-accent-600 border-b-2 border-accent-600"
                >
                  Settings
                </NuxtLink>
              </nav>
            </div>
            <div class="flex items-center">
              <div class="ml-3 relative">
                <div>
                  <button 
                    @click="isUserMenuOpen = !isUserMenuOpen" 
                    class="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500"
                    id="user-menu-button"
                    aria-expanded="false"
                    aria-haspopup="true"
                  >
                    <span class="sr-only">Open user menu</span>
                    <div class="h-8 w-8 rounded-full bg-accent-200 flex items-center justify-center text-accent-600">
                      {{ userInitial }}
                    </div>
                  </button>
                </div>
                <div 
                  v-if="isUserMenuOpen" 
                  class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="user-menu-button"
                  tabindex="-1"
                >
                  <a 
                    href="#" 
                    @click.prevent="signOut"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" 
                    role="menuitem" 
                    tabindex="-1"
                  >
                    Sign out
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
  
      <main class="flex-grow pt-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <slot />
        </div>
      </main>
  
      <footer class="bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p class="text-center text-sm text-gray-500">
            © {{ new Date().getFullYear() }} SubscriptionTracker
          </p>
        </div>
      </footer>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';
  import { useRouter } from 'vue-router';
  
  const router = useRouter();
  const isUserMenuOpen = ref(false);
  
  // Mock user data - in a real app, this would come from your auth store
  const user = ref({
    email: 'user@example.com',
    name: 'User'
  });
  
  const userInitial = computed(() => {
    return user.value.name ? user.value.name.charAt(0).toUpperCase() : '?';
  });
  
  const signOut = () => {
    // In a real app, this would call your auth service
    console.log('Signing out...');
    router.push('/login');
  };
  </script>