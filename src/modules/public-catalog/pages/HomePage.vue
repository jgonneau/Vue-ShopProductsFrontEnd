<script setup lang="ts">
import { computed } from 'vue'
import AuthNav from '../../auth/components/AuthNav.vue'
import { useAuthStore } from '../../auth/stores/auth-store'
import { useApiSchema } from '../composables/useApiSchema'

const schemaQuery = useApiSchema()
const auth = useAuthStore()

const schemaTitle = computed(() => schemaQuery.data.value?.title ?? 'Unknown schema')
const schemaVersion = computed(() => schemaQuery.data.value?.version ?? 'n/a')
</script>

<template>
  <main class="container">
    <AuthNav />
    <h1>Shop Products Frontend</h1>
    <p>This baseline now includes Phase 1 authentication and route protection.</p>

    <section v-if="auth.isAuthenticated" class="panel">
      <p>
        Signed in as <strong>{{ auth.user?.email }}</strong> (role: <code>{{ auth.userRole }}</code
        >)
      </p>
    </section>
    <section v-else class="panel">
      <p>You are currently browsing as a guest.</p>
    </section>

    <section class="panel">
      <h2>Backend connectivity check</h2>
      <p v-if="schemaQuery.isPending.value">Checking `/api/schema/`...</p>
      <p v-else-if="schemaQuery.isError.value" class="error">
        Unable to reach backend schema endpoint.
      </p>
      <div v-else class="success">
        <p><strong>Schema title:</strong> {{ schemaTitle }}</p>
        <p><strong>Schema version:</strong> {{ schemaVersion }}</p>
        <p><strong>Top-level keys:</strong> {{ schemaQuery.data.value?.keys.length }}</p>
      </div>
    </section>
  </main>
</template>
