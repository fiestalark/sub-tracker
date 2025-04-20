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
            <template v-if="user">
              <span>{{ user.email }}</span>
              <button @click="logout" class="logout-button">Logout</button>
            </template>
            <button v-else @click="login" class="login-button">Login</button>
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
import { useSupabaseUser, useSupabaseClient } from '#imports'
import { navigateTo } from '#app'

const user = useSupabaseUser()
const supabase = useSupabaseClient()

const login = async () => {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        scopes: 'openid email profile https://www.googleapis.com/auth/gmail.readonly',
        redirectTo: `${window.location.origin}/auth/callback` // Ensure correct redirect
      }
    })
    if (error) throw error
  } catch (error) {
    console.error('Error during Google sign-in:', error)
    // Optionally show a user-facing error message
  }
}

const logout = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    await navigateTo('/login') // Navigate after successful logout
  } catch (error) {
    console.error('Error during sign-out:', error)
  }
}
</script>

