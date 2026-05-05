<script setup lang="ts">
import AuthNav from '../components/AuthNav.vue'
</script>

<template>
  <main class="container">
    <AuthNav />
    <h1>Admin Area</h1>
    <section class="panel">
      <p>This route is restricted to users with the <code>admin</code> role.</p>
      <p>Phase 5 will expand this into full admin CRUD and logs workflows.</p>
    </section>
  </main>
</template>
