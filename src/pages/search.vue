<script setup>
import { ref, computed, watchEffect } from 'vue'
import { useProducts } from '@/composables/useProducts'

const { products, loading, error } = useProducts() // Now includes loading and error from API fetch
const searchQuery = ref('')
const selectedCategory = ref('')

// Compute unique categories from products for the dropdown
const categories = computed(() => {
  if (!products.value || products.value.length === 0) return []
  const cats = products.value.map((product) => product.category)
  return [...new Set(cats)]
})

// Filter products based on search query and selected category
const filteredProducts = computed(() => {
  if (!products.value || products.value.length === 0) return []
  return products.value.filter((product) => {
    const matchesName = product.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesCategory = selectedCategory.value
      ? product.category.toLowerCase() === selectedCategory.value.toLowerCase()
      : true
    return matchesName && matchesCategory
  })
})

// Debug: Log products and categories (optional)
watchEffect(() => {
  console.log('Products:', products.value)
  console.log('Categories:', categories.value)
})
</script>

<template>
  <div class="search-container">
    <h1>Search Products</h1>
    <div class="search-filters">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Enter product name..."
        class="search-input"
      />
      <select v-model="selectedCategory" class="category-select">
        <option value="">All Categories</option>
        <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
      </select>
    </div>

    <!-- Display loading or error messages -->
    <div v-if="loading">Loading products...</div>
    <div v-else-if="error" class="error-message">Error: {{ error.message }}</div>

    <!-- Display the product list when data is available -->
    <div v-else class="products-list">
      <div v-for="product in filteredProducts" :key="product.id" class="product-card">
        <img :src="product.image" :alt="product.name" />
        <div class="product-details">
          <h3>{{ product.name }}</h3>
          <p>Category: {{ product.category }}</p>
          <p>Quantity: {{ product.quantity }}</p>
          <p>MRP: {{ product.mrp }}/-</p>
          <p>Selling Price: {{ product.sellingPrice }}/-</p>
          <p>Location: Rack {{ product.location.rack }}, Row {{ product.location.row }}</p>
          <p>Expiry: {{ product.expiryDate.split('T')[0] }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.search-container {
  padding: 20px;
  background-color: #fafafa;
}

.search-filters {
  display: flex;
  gap: 10px;
  margin: 20px 0;
}

.search-input {
  flex: 1;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.category-select {
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.error-message {
  color: red;
  margin-bottom: 10px;
}

.products-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
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
  max-width: 100%;
  object-fit: cover;
  height: 200px;
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
</style>
