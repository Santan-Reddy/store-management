<script setup>
import { ref } from 'vue'

const navLinks = ref([
  { name: 'Dashboard', path: '/' },
  { name: 'Search Products', path: '/search' },
  { name: 'New Bill ', path: '/new-bill' },
  { name: 'Update Stock', path: '/update-stock' },
  { name: 'Expired Stock', path: '/expired-stock' },
  { name: 'Discount', path: '/discount' },
  { name: 'Admin', path: '/profile' },
])

const adminLink = ref({ name: 'Admin', path: '/profile' })
</script>

<template>
  <div>
    <div class="sidebar">
      <h2>Store Name</h2>
      <div class="links">
        <router-link v-for="link in navLinks" :key="link.path" :to="link.path">
          {{ link.name }}
        </router-link>
      </div>
      <!-- <div class="profile">
        <router-link :to="adminLink.path">
          {{ adminLink.name }}
        </router-link>
      </div> -->
    </div>
  </div>
</template>

<style scoped>
.sidebar {
  width: 250px;
  height: 100%;
  min-height: 100vh;
  background-color: #ede7f6;
  color: #4a148c;
  display: flex;
  flex-direction: column;
  padding: 20px;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
}

.sidebar a {
  color: #4a148c;
  text-decoration: none;
  padding: 15px 20px;
  margin: 10px 0;
  border-radius: 4px;
  transition: background-color 0.3s;
  display: flex;
  align-items: center;
}

.sidebar a:hover {
  background-color: #d1c4e9;
}

.sidebar a.router-link-exact-active {
  background-color: #b39ddb;
}

.sidebar .profile {
  margin-top: auto;
}

.links {
  margin-top: 20px;
}
</style>
