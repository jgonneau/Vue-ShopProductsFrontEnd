<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import type { Product } from '../types'
import { useCart } from '@/modules/shop-products/composables/useCart'

const props = withDefaults(
  defineProps<{
    product: Product
    label?: string
  }>(),
  {
    label: 'Add to cart',
  },
)

const cart = useCart()
const isAdding = ref(false)
let animationTimer: number | undefined

const onAddToCart = () => {
  cart.add(props.product)

  isAdding.value = false
  if (animationTimer) {
    globalThis.clearTimeout(animationTimer)
  }

  // Re-enable class on next frame so rapid clicks replay animation.
  globalThis.requestAnimationFrame(() => {
    isAdding.value = true
    animationTimer = globalThis.setTimeout(() => {
      isAdding.value = false
      animationTimer = undefined
    }, 280)
  })
}

onBeforeUnmount(() => {
  if (animationTimer) {
    globalThis.clearTimeout(animationTimer)
  }
})
</script>

<template>
  <button type="button" class="sp-card-add" :class="{ 'is-adding': isAdding }" @click="onAddToCart">
    {{ label }}
  </button>
</template>
