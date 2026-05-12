<script setup lang="ts">
import CartAddButton from './CartAddButton.vue'
import type { Product } from '../types'

withDefaults(
  defineProps<{
    product: Product
    label?: string
  }>(),
  {
    label: 'Add to cart',
  },
)
</script>

<template>
  <CartAddButton :product="product" :label="label" v-bind="$attrs" />
</template>
