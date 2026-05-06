<script setup lang="ts">
import { useToastBus } from './toast-bus'

const { toasts, dismissToast } = useToastBus()
</script>

<template>
  <div class="toast-region" role="status" aria-live="polite" aria-atomic="true">
    <div v-for="toast in toasts" :key="toast.id" :class="`toast toast--${toast.variant}`">
      <span>{{ toast.message }}</span>
      <button type="button" aria-label="Dismiss notification" @click="dismissToast(toast.id)">
        ×
      </button>
    </div>
  </div>
</template>
