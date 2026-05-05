<script setup lang="ts">
import AuthNav from '../components/AuthNav.vue'
</script>

<template>
  <main class="container">
    <AuthNav />
    <h1>Vendor Area</h1>
    <section class="panel">
      <p>This route is restricted to users with <code>vendor</code> or <code>admin</code> role.</p>
      <p>Phase 4 will expand this into owned stores and store product management.</p>
    </section>
  </main>
</template>
