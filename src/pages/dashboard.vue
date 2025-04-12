<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useProducts } from '@/composables/useProducts'

const { products, loading, error } = useProducts()
const router = useRouter()

// Define thresholds
const expiryThresholdDays = 7
const lowStockThreshold = 10

// Current date for comparison
const now = new Date()

// Compute products that are expiring soon or already expired
const expiringProducts = computed(() => {
  return products.value.filter((product) => {
    const expiry = new Date(product.expiryDate)
    const diffDays = (expiry - now) / (1000 * 60 * 60 * 24)
    return diffDays <= expiryThresholdDays
  })
})

// Compute products that are low on stock
const lowStockProducts = computed(() => {
  return products.value.filter((product) => product.quantity < lowStockThreshold)
})

// Compute most selling products (we assume "soldCount" reflects sales in the last 7 days)
const mostSellingProducts = computed(() => {
  return [...products.value].sort((a, b) => b.soldCount - a.soldCount).slice(0, 4)
})

// Navigation helper
function navigateTo(path) {
  router.push(path)
}
</script>

<template>
  <div class="dashboard-container">
    <h1>Dashboard</h1>

    <!-- Loading and Error states -->
    <div v-if="loading">Loading products...</div>
    <div v-else>
      <div v-if="error" class="error-message">{{ error.message }}</div>

      <!-- Top Action Buttons -->
      <div class="dashboard-actions">
        <button @click="navigateTo('/search')">Search Product</button>
        <button @click="navigateTo('/new-bill')">New Bill</button>
      </div>

      <!-- Expiry Section -->
      <div class="section">
        <div class="section-header">
          <h2>Expiring / Expired Products</h2>
          <button @click="navigateTo('/expired-stock')">View All</button>
        </div>
        <div class="products-list">
          <div
            v-for="product in expiringProducts.slice(0, 4)"
            :key="product.id"
            class="product-card"
          >
            <img :src="product.image" :alt="product.name" />
            <div class="product-details">
              <h3>{{ product.name }}</h3>
              <p>Quantity: {{ product.quantity }}</p>
              <p>MRP: {{ product.mrp }}/-</p>
              <p>Selling Price: {{ product.sellingPrice }}/-</p>
              <p>Location: Rack {{ product.location.rack }}, Row {{ product.location.row }}</p>
              <p>Expiry: {{ product.expiryDate.split('T')[0] }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Low Stock Section -->
      <div class="section">
        <div class="section-header">
          <h2>Low Stock Products</h2>
          <button @click="navigateTo('/update-stock')">View All</button>
        </div>
        <div class="products-list">
          <div
            v-for="product in lowStockProducts.slice(0, 4)"
            :key="product.id"
            class="product-card"
          >
            <img :src="product.image" :alt="product.name" />
            <div class="product-details">
              <h3>{{ product.name }}</h3>
              <p>Quantity: {{ product.quantity }}</p>
              <p>MRP: {{ product.mrp }}/-</p>
              <p>Selling Price: {{ product.sellingPrice }}/-</p>
              <p>Location: Rack {{ product.location.rack }}, Row {{ product.location.row }}</p>
              <p>Expiry: {{ product.expiryDate.split('T')[0] }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Most Selling Products Section -->
      <div class="section">
        <div class="section-header">
          <h2>Most Selling Products (Last 7 Days)</h2>
        </div>
        <div class="products-list">
          <div v-for="product in mostSellingProducts" :key="product.id" class="product-card">
            <img :src="product.image" :alt="product.name" />
            <div class="product-details">
              <h3>{{ product.name }}</h3>
              <p>Selling Price: {{ product.sellingPrice }}/-</p>
              <p>Quantity Sold: {{ product.soldCount }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-container {
  padding: 20px;
  background-color: #fafafa;
}

.dashboard-actions {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  margin-top: 10px;
}

.dashboard-actions button {
  padding: 10px 20px;
  background-color: #4a148c;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.dashboard-actions button:hover {
  background-color: #6a1b9a;
}

.section {
  margin-bottom: 40px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  margin: 0;
  font-size: 1.5em;
  color: #4a148c;
}

.section-header button {
  padding: 8px 16px;
  background-color: #b39ddb;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  color: #fff;
}

.section-header button:hover {
  background-color: #9575cd;
}

.products-list {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.product-card {
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 10px;
  width: calc(25% - 20px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.2s;
}

.product-card:hover {
  transform: translateY(-5px);
}

.product-card img {
  height: 200px;
  max-width: 100%;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 10px;
}

.product-details {
  text-align: center;
}

.product-details h3 {
  margin: 5px 0;
  font-size: 1.1em;
  color: #4a148c;
}

.product-details p {
  margin: 4px 0;
  font-size: 0.9em;
  color: #555;
}

.error-message {
  color: red;
  margin-bottom: 20px;
}
</style>
