<script setup>
import { ref, computed } from 'vue'
import { useProducts } from '@/composables/useProducts'

const { products } = useProducts()

// Search query to filter products
const searchQuery = ref('')

// Reactive object to store profit margin percentages keyed by product ID.
const profitMarginValues = ref({})

// Reactive object to store manual entered price keyed by product ID.
const manualPriceValues = ref({})

// Computed property to filter products based on the search query.
const filteredProducts = computed(() => {
  if (!searchQuery.value.trim()) {
    return products.value
  }
  return products.value.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
  )
})

// Function to apply profit margin to a product.
// New selling price = costPrice * (1 + profit/100)
function applyProfitMargin(productId) {
  const profit = parseFloat(profitMarginValues.value[productId])
  if (isNaN(profit) || profit < 0) {
    alert('Please enter a valid profit margin percentage (>= 0)')
    return
  }
  const product = products.value.find((p) => p.id === productId)
  if (product) {
    product.sellingPrice = parseFloat((product.costPrice * (1 + profit / 100)).toFixed(2))
    alert(
      `Profit margin of ${profit}% applied to ${product.name}. New selling price: ${product.sellingPrice}/-`,
    )
  }
}

// Function to manually update selling price using an entered price.
function applyManualPrice(productId) {
  const newPrice = parseFloat(manualPriceValues.value[productId])
  if (isNaN(newPrice) || newPrice < 0) {
    alert('Please enter a valid price')
    return
  }
  const product = products.value.find((p) => p.id === productId)
  if (product) {
    product.sellingPrice = parseFloat(newPrice.toFixed(2))
    alert(`New selling price for ${product.name} updated to ${product.sellingPrice}/-`)
  }
}
</script>

<template>
  <div class="discount-container">
    <h1>Update Price</h1>
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
          <th>Cost Price</th>
          <th>Current Selling Price</th>
          <th>Profit Margin (%)</th>
          <th>Action (Apply Profit)</th>
          <th>Enter Price</th>
          <th>Update Price</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="product in filteredProducts" :key="product.id">
          <td>{{ product.name }}</td>
          <td>{{ product.costPrice }}/-</td>
          <td>{{ product.sellingPrice }}/-</td>
          <td>
            <input
              type="number"
              v-model="profitMarginValues[product.id]"
              min="0"
              placeholder="Profit %"
            />
          </td>
          <td>
            <button @click="applyProfitMargin(product.id)">Apply Profit</button>
          </td>
          <td>
            <input
              type="number"
              v-model="manualPriceValues[product.id]"
              min="0"
              placeholder="Enter Price"
            />
          </td>
          <td>
            <button @click="applyManualPrice(product.id)">Update Price</button>
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
  margin-top: 10px;
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
