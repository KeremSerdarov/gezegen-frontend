<script setup>
import Navbar from './components/layouts/Navbar.vue';

</script>

<template>
  <div class="p-6 m-0 bg-blue-100 dark:bg-blue-900 ">
    <Navbar />
    <RouterView />
  </div>
</template>

<style scoped></style>
