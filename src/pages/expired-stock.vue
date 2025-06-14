<script setup>
import { computed, ref } from 'vue'
import { useProducts } from '@/composables/useProducts'
import api from '@/api' // Axios instance for API calls

const { products, refreshProducts } = useProducts()

const now = new Date()
const expiryThresholdDays = 7

// Compute expired products (expiry date in the past)
const expiredProducts = computed(() => {
  return products.value.filter((product) => new Date(product.expiryDate) < now)
})

// Compute products expiring soon (within expiryThresholdDays)
const expiringProducts = computed(() => {
  return products.value.filter((product) => {
    const expiryDate = new Date(product.expiryDate)
    const daysLeft = (expiryDate - now) / (1000 * 60 * 60 * 24)
    return daysLeft >= 0 && daysLeft <= expiryThresholdDays
  })
})

// Function to remove a single expired product from stock via API call
async function removeFromStock(product) {
  const productId = product.id || product._id
  if (product && product.quantity !== 0) {
    if (
      confirm(
        `Are you sure you want to remove ${product.name} from stock? This will set its quantity to 0.`,
      )
    ) {
      try {
        await api.patch(`/products/${productId}`, { quantity: 0 })
        product.quantity = 0 // update local state
        // Optionally, refresh the product list:
        // await refreshProducts()
      } catch (error) {
        alert('Error updating product: ' + error.message)
      }
    }
  }
}

// Function to remove all expired products from stock using API calls
async function removeAllExpired() {
  if (
    confirm(
      'Are you sure you want to remove all expired products from stock? This will set their quantities to 0.',
    )
  ) {
    for (const product of expiredProducts.value) {
      if (product.quantity !== 0) {
        try {
          const productId = product.id || product._id
          await api.patch(`/products/${productId}`, { quantity: 0 })
          product.quantity = 0
        } catch (error) {
          console.error('Error updating product', productId, error)
        }
      }
    }
    // Optionally, refresh the product list:
    // await refreshProducts()
  }
}

// --- Profit functionality for expiring products --- //

// Reactive object to store profit percentages keyed by product id.
const profitValues = ref({})

// Function to apply profit margin to a product that is expiring soon.
// New selling price = costPrice * (1 + profit/100)
async function applyProfit(product) {
  const productId = product.id || product._id
  const profit = parseFloat(profitValues.value[productId])
  if (isNaN(profit) || profit < 0) {
    alert('Please enter a valid profit percentage (>= 0)')
    return
  }
  if (product) {
    const newSellingPrice = parseFloat((product.costPrice * (1 + profit / 100)).toFixed(2))
    try {
      await api.patch(`/products/${productId}`, { sellingPrice: newSellingPrice })
      product.sellingPrice = newSellingPrice // update local state
      alert(
        `Profit margin of ${profit}% applied to ${product.name}. New selling price: ${product.sellingPrice}/-`,
      )
    } catch (error) {
      alert('Error applying profit margin: ' + error.message)
    }
  }
}

// Helper function to compute current profit percentage from cost & selling prices.
function getCurrentProfit(product) {
  if (product.costPrice > 0) {
    return ((product.sellingPrice / product.costPrice - 1) * 100).toFixed(2)
  }
  return 'N/A'
}
</script>

<template>
  <div class="expired-stock-container">
    <h1>Expired & Expiring Soon Stock</h1>

    <!-- Expired Products Section -->
    <section class="expired-section">
      <h2>Expired Products</h2>
      <p>Total Expired Products: {{ expiredProducts.length }}</p>
      <button class="remove-all-btn" @click="removeAllExpired">
        Remove All Expired from Stock
      </button>
      <table class="data-table">
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Current Quantity</th>
            <th>Expiry Date</th>
            <th>Days Expired</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in expiredProducts" :key="product.id || product._id">
            <td>{{ product.name }}</td>
            <td>{{ product.quantity }}</td>
            <td>{{ product.expiryDate.split('T')[0] }}</td>
            <td>{{ Math.floor((now - new Date(product.expiryDate)) / (1000 * 60 * 60 * 24)) }}</td>
            <td>
              <button @click="removeFromStock(product)" :disabled="product.quantity === 0">
                {{ product.quantity === 0 ? 'Removed' : 'Remove from Stock' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- Expiring Soon Products Section -->
    <section class="expiring-section">
      <h2>Products Expiring Soon (within {{ expiryThresholdDays }} days)</h2>
      <p>Total Expiring Products: {{ expiringProducts.length }}</p>
      <table class="data-table">
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Current Quantity</th>
            <th>Expiry Date</th>
            <th>Days to Expiry</th>
            <th>Profit (%)</th>
            <th>Action</th>
            <th>Price Info</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in expiringProducts" :key="product.id || product._id">
            <td>{{ product.name }}</td>
            <td>{{ product.quantity }}</td>
            <td>{{ product.expiryDate.split('T')[0] }}</td>
            <td>{{ Math.floor((new Date(product.expiryDate) - now) / (1000 * 60 * 60 * 24)) }}</td>
            <td>
              <input
                type="number"
                v-model="profitValues[product.id || product._id]"
                min="0"
                placeholder="Profit %"
              />
            </td>
            <td>
              <button @click="applyProfit(product)">Apply Profit</button>
            </td>
            <td>
              Cost: {{ product.costPrice }}/- , Selling: {{ product.sellingPrice }}/- ({{
                getCurrentProfit(product)
              }}%)
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<style scoped>
.expired-stock-container {
  padding: 20px;
  background-color: #fafafa;
}

.expired-stock-container h1 {
  margin-bottom: 20px;
  color: #c62828;
  text-align: center;
}

section {
  margin-bottom: 40px;
}

section h2 {
  margin-bottom: 10px;
  color: #c62828;
}

section p {
  margin-bottom: 10px;
  font-size: 1.1em;
}

.remove-all-btn {
  padding: 10px 20px;
  margin-bottom: 20px;
  background-color: #c62828;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.remove-all-btn:hover {
  background-color: #d32f2f;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

.data-table th,
.data-table td {
  border: 1px solid #ddd;
  padding: 12px;
  text-align: left;
}

.data-table th {
  background-color: #f4f4f4;
  font-weight: bold;
}

.data-table input[type='number'] {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.data-table button {
  padding: 8px 16px;
  background-color: #4a148c;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.data-table button:hover:not(:disabled) {
  background-color: #6a1b9a;
}

.data-table button:disabled {
  background-color: #9e9e9e;
  cursor: not-allowed;
}
</style>
