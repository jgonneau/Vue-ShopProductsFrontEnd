<script setup lang="ts">
import { computed } from 'vue'
import { useApiSchema } from '../composables/useApiSchema'

const schemaQuery = useApiSchema()

const schemaTitle = computed(() => schemaQuery.data.value?.title ?? 'Unknown schema')
const schemaVersion = computed(() => schemaQuery.data.value?.version ?? 'n/a')
</script>

<template>
  <main class="container">
    <h1>Shop Products Frontend</h1>
    <p>This is the Phase 0 baseline setup for the Vue frontend.</p>

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
