<template>
  <div class="app-layout">
    <header class="app-header">
      <div class="container header-container">
        <div class="logo">SubTracker</div>
        <nav class="navigation">
          <NuxtLink to="/">Dashboard</NuxtLink>
          <NuxtLink to="/settings">Settings</NuxtLink>
          <!-- Add more nav links as needed -->
        </nav>
        <div class="user-profile">
          <!-- Placeholder for user avatar/login status -->
          <span v-if="user">{{ user.email }}</span>
          <NuxtLink v-else to="/login">Login</NuxtLink>
        </div>
      </div>
    </header>

    <main class="main-content">
      <div class="container">
        <slot />
      </div>
    </main>

    <footer class="app-footer">
      <div class="container">
        <p>&copy; {{ new Date().getFullYear() }} SubTracker. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
// Placeholder for user state - replace with actual auth logic later
// const user = useSupabaseUser() // Example if using Nuxt Supabase module
const user = ref(null) // Simulate logged out state

// If using Supabase client directly
// import { useSupabaseClient } from '#imports'
// const supabase = useSupabaseClient()
// const { data: { user } } = await supabase.auth.getUser()
</script>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.container {
  width: 100%;
  max-width: 70%;
  margin-left: auto;
  margin-right: auto;
  padding-left: var(--space-md);
  padding-right: var(--space-md);
}

.app-header {
  position: sticky; /* Make header fixed if desired */
  top: 0;
  z-index: 10;
  background-color: var(--color-bg);
  border-bottom: 1px solid var(--color-border);
  padding-top: var(--space-md);
  padding-bottom: var(--space-md);
  box-shadow: var(--box-shadow);
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-weight: 700;
  font-size: var(--font-xl);
  color: var(--color-accent);
}

.navigation a {
  margin: 0 var(--space-md);
  color: var(--color-text);
  position: relative;
  padding-bottom: var(--space-xs);
  transition: color var(--transition-duration) var(--transition-timing);
}

.navigation a::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: var(--color-accent);
  transform: scaleX(0);
  transform-origin: bottom right;
  transition: transform var(--transition-duration) var(--transition-timing);
}

.navigation a:hover,
.navigation a.router-link-exact-active {
  color: var(--color-accent);
}

.navigation a:hover::after,
.navigation a.router-link-exact-active::after {
  transform: scaleX(1);
  transform-origin: bottom left;
}

.user-profile {
  font-size: var(--font-sm);
  color: var(--color-muted);
}

.user-profile a {
  color: var(--color-accent);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.main-content {
  flex-grow: 1;
  padding-top: var(--space-xl);
  padding-bottom: var(--space-xl);
}

.app-footer {
  background-color: var(--color-bg);
  border-top: 1px solid var(--color-border);
  padding: var(--space-md) 0;
  margin-top: var(--space-2xl);
  text-align: center;
  font-size: var(--font-sm);
  color: var(--color-muted);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .navigation {
    display: none; /* Simple hide for mobile, can implement burger menu later */
  }
  .header-container {
    justify-content: space-between;
  }
}
</style> 