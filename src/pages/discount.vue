<script setup>
import { ref, computed } from 'vue'
import { useProducts } from '@/composables/useProducts'

const { products } = useProducts()

// Search query to filter products
const searchQuery = ref('')

// Reactive object to store discount percentages keyed by product ID
const discountValues = ref({})

// Computed property to filter products based on the search query
const filteredProducts = computed(() => {
  if (!searchQuery.value.trim()) {
    return products.value
  }
  return products.value.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
  )
})

// Function to apply discount to a product
function applyDiscount(productId) {
  const discount = parseFloat(discountValues.value[productId])
  if (isNaN(discount) || discount < 0 || discount > 100) {
    alert('Please enter a valid discount percentage (0-100)')
    return
  }
  const product = products.value.find((p) => p.id === productId)
  if (product) {
    // Calculate new selling price based on the discount percentage.
    // Note: In a real app, you might want to preserve the original price.
    product.sellingPrice = parseFloat((product.sellingPrice * (1 - discount / 100)).toFixed(2))
    alert(
      `Discount of ${discount}% applied to ${product.name}. New price: ${product.sellingPrice}/-`,
    )
  }
}
</script>

<template>
  <div class="discount-container">
    <h1>Discount</h1>
    <div class="search-section">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search products..."
        class="search-input"
      />
    </div>
    <table class="discount-table">
      <thead>
        <tr>
          <th>Product Name</th>
          <th>Current Selling Price</th>
          <th>Discount (%)</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="product in filteredProducts" :key="product.id">
          <td>{{ product.name }}</td>
          <td>{{ product.sellingPrice }}/-</td>
          <td>
            <input
              type="number"
              v-model="discountValues[product.id]"
              min="0"
              max="100"
              placeholder="Discount"
            />
          </td>
          <td>
            <button @click="applyDiscount(product.id)">Apply Discount</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.discount-container {
  padding: 20px;
  background-color: #fafafa;
}

.search-section {
  margin-bottom: 20px;
}

.search-input {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.discount-table {
  width: 100%;
  border-collapse: collapse;
}

.discount-table th,
.discount-table td {
  border: 1px solid #ddd;
  padding: 12px;
  text-align: left;
}

.discount-table th {
  background-color: #f4f4f4;
  font-weight: bold;
}

.discount-table input[type='number'] {
  width: 80px;
  padding: 6px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.discount-table button {
  padding: 6px 12px;
  background-color: #4a148c;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.discount-table button:hover {
  background-color: #6a1b9a;
}
</style>
