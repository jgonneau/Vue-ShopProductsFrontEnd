<script setup lang="ts">
defineProps<{
  page: number
  hasPrevious: boolean
  hasNext: boolean
}>()

const emit = defineEmits<{
  previous: []
  next: []
}>()
</script>

<template>
  <div class="pagination-controls">
    <button type="button" :disabled="!hasPrevious" @click="emit('previous')">Previous</button>
    <span>Page {{ page }}</span>
    <button type="button" :disabled="!hasNext" @click="emit('next')">Next</button>
  </div>
</template>
