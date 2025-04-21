<template>
  <div v-if="unparsed && unparsed.length > 0" class="unparsed-list-container">
    <h2>Unparsed Emails</h2>
    <p>These emails could not be automatically processed:</p>
    <ul>
      <li v-for="(email, index) in unparsed" :key="index">
        <strong>Subject:</strong> {{ email.subject }} <br>
        <strong>Sender:</strong> {{ email.sender }} <br>
        <strong>Date:</strong> {{ formatDate(email.date) }}
        <!-- Add more details or actions if needed -->
      </li>
    </ul>
  </div>
  <div v-else>
    <!-- Optional: Message when there are no unparsed emails -->
    <!-- <p>No unparsed emails found.</p> -->
  </div>
</template>

<script setup lang="ts">
import { withDefaults } from 'vue'
import type { GmailSyncResponse } from '@/types/gmailSync'

const props = withDefaults(
  defineProps<{
    /** array of messages the parser couldn’t handle */
    unparsed?: GmailSyncResponse['unparsed']
  }>(),
  {
    // when the parent hasn’t provided the prop yet
    unparsed: () => [],
  }
)

// Basic date formatting, consider using a library like date-fns for robust formatting
const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString()
  } catch (e) {
    return dateString // Return original string if parsing fails
  }
}
</script>

<style scoped>
.unparsed-list-container {
  margin-top: 2rem;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #f9f9f9;
}

h2 {
  margin-bottom: 0.5rem;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  margin-bottom: 0.75rem;
  padding: 0.5rem;
  border-bottom: 1px solid #eee;
}

li:last-child {
  border-bottom: none;
}

strong {
  margin-right: 0.5em;
}
</style> 