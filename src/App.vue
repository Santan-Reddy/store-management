<script setup>
import Sidebar from './components/sidebar.vue'
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="app-container">
    <Sidebar />
    <div class="content">
      <router-view />
    </div>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
}

.content {
  flex-grow: 1;
  padding: 20px;
  background-color: #fafafa;
}
</style>
