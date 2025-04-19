<template>
  <div class="settings-page">
    <h1>Settings</h1>

    <AppCard title="Account Information">
      <p>Email: {{ userEmail }}</p>
      <!-- Add more account details if needed -->
      <AppButton variant="secondary" @click="handleLogout">Logout</AppButton>
    </AppCard>

    <AppCard title="Digest Preferences" class="settings-section">
      <form @submit.prevent="savePreferences">
        <div class="form-group">
          <label for="digest-frequency">Digest Frequency:</label>
          <select id="digest-frequency" v-model="digestFrequency">
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="never">Never</option>
          </select>
        </div>

        <!-- Add more settings like notification channel etc. -->

        <AppButton type="submit">Save Preferences</AppButton>
      </form>
    </AppCard>

    <AppCard title="Connected Accounts" class="settings-section">
       <p>Manage your connected Gmail account.</p>
       <!-- Placeholder for connection status and actions -->
       <p>Status: <strong>Connected</strong> (example@gmail.com)</p>
       <AppButton variant="danger" @click="revokeAccess">Revoke Gmail Access</AppButton>
       <!-- Add button to re-grant access if needed -->
       <!-- Banner for re-granting access (design.md) -->
       <!--
       <div class="regrant-banner" v-if="needsReGrant">
          <p>Your Gmail connection needs to be refreshed.</p>
          <AppButton @click="reGrantAccess">Re-authorize Gmail</AppButton>
       </div>
       -->
    </AppCard>

    <!-- Add more settings sections as needed -->

  </div>
</template>

<script setup>
definePageMeta({
  layout: 'default',
  // Add middleware later for authentication if needed
  // middleware: ['auth']
})

// Placeholder data and functions - replace with actual logic
const userEmail = ref('user@example.com') // Get from user state
const digestFrequency = ref('monthly') // Get from user settings

const savePreferences = () => {
  console.log('Saving preferences:', { frequency: digestFrequency.value });
  // Add API call to save settings
}

const handleLogout = () => {
  console.log('Logging out...');
  // Add logout logic (e.g., Supabase auth signout)
  // const router = useRouter()
  // router.push('/login')
}

const revokeAccess = () => {
  console.warn('Revoking Gmail access...');
  // Add logic to revoke token and update DB/UI
}

// const needsReGrant = ref(false) // State for the re-grant banner
// const reGrantAccess = () => {
//   console.log('Re-granting access...');
//   // Trigger OAuth flow again
// }
</script>

<style scoped>
.settings-page h1 {
  margin-bottom: var(--space-lg);
}

.settings-section {
  margin-top: var(--space-xl);
}

.form-group {
  margin-bottom: var(--space-lg);
}

.form-group label {
  display: block;
  margin-bottom: var(--space-sm);
  font-weight: 500;
}

.form-group select,
.form-group input[type="text"],
.form-group input[type="email"] {
  width: 100%;
  max-width: 400px; /* Limit width of inputs */
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  background-color: var(--color-bg);
  transition: border-color var(--transition-duration), box-shadow var(--transition-duration);
}

.form-group select:focus,
.form-group input:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2); /* Focus ring */
}

/* Style radio buttons/checkboxes if added */

.regrant-banner {
  margin-top: var(--space-lg);
  padding: var(--space-md);
  background-color: var(--color-error-bg);
  border: 1px solid var(--color-error-text);
  border-radius: var(--border-radius-md);
  color: var(--color-error-text);
  display: flex;
  justify-content: space-between;
  align-items: center;
  /* Add slide-in animation (design.md) */
  animation: slideIn 0.5s ease-out forwards;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.regrant-banner p {
  margin: 0;
  margin-right: var(--space-md);
}
</style> 