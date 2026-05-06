<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  status: string | null | undefined
}>()

const normalizedStatus = computed(() => (props.status ?? 'unknown').toLowerCase())
const label = computed(() => normalizedStatus.value.replaceAll('_', ' '))
const badgeClass = computed(() => `status-badge status-badge--${normalizedStatus.value}`)
</script>

<template>
  <span :class="badgeClass">{{ label }}</span>
</template>
