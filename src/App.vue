<script setup lang="ts">
import { RouterView } from 'vue-router'
import CartSheet from './modules/shop-products/components/CartSheet.vue'
import GlobalToasts from './shared/ui/GlobalToasts.vue'
</script>

<template>
  <a href="#app-content" class="skip-link">Skip to content</a>
  <div id="app-content">
    <RouterView />
  </div>
  <CartSheet />
  <GlobalToasts />
</template>
