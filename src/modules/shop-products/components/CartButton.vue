<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import { useCart } from '../composables/useCart'

const cart = useCart()
const isAddedPulse = ref(false)
let pulseTimer: number | undefined

watch(
  () => cart.count.value,
  (nextCount, previousCount) => {
    if (typeof previousCount !== 'number' || nextCount <= previousCount) {
      return
    }

    isAddedPulse.value = false
    if (pulseTimer) {
      globalThis.clearTimeout(pulseTimer)
    }

    globalThis.requestAnimationFrame(() => {
      isAddedPulse.value = true
      pulseTimer = globalThis.setTimeout(() => {
        isAddedPulse.value = false
        pulseTimer = undefined
      }, 320)
    })
  },
)

onBeforeUnmount(() => {
  if (pulseTimer) {
    globalThis.clearTimeout(pulseTimer)
  }
})
</script>

<template>
  <button
    type="button"
    class="white-button sp-cart-button"
    :class="{ 'is-added-pulse': isAddedPulse }"
    @click="cart.setOpen(true)"
  >
    <span class="sp-link-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M5 8h14l-1 12H6L5 8Z" />
        <path d="M9 8V6a3 3 0 0 1 6 0v2" />
      </svg>
    </span>
    Cart
    <span v-if="cart.count.value" class="cart-count">{{ cart.count.value }}</span>
  </button>
</template>

<style scoped>
.sp-cart-button {
  transition: transform 160ms ease;
}

.sp-cart-button.is-added-pulse {
  animation: sp-cart-added 320ms ease;
}

@keyframes sp-cart-added {
  0% {
    transform: scale(1);
  }
  40% {
    transform: scale(1.08);
  }
  100% {
    transform: scale(1);
  }
}
</style>
