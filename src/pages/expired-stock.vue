<script setup>
import { computed, ref } from 'vue'
import { useProducts } from '@/composables/useProducts'

const { products } = useProducts()
const now = new Date()
const expiryThresholdDays = 7

// Compute expired products (expiry date in the past)
const expiredProducts = computed(() => {
  return products.value.filter((product) => new Date(product.expiryDate) < now)
})

// Compute products expiring soon (expiry date in the future within threshold)
const expiringProducts = computed(() => {
  return products.value.filter((product) => {
    const expiryDate = new Date(product.expiryDate)
    const daysLeft = (expiryDate - now) / (1000 * 60 * 60 * 24)
    return daysLeft >= 0 && daysLeft <= expiryThresholdDays
  })
})

// Function to remove a single expired product from stock (set quantity to 0)
function removeFromStock(productId) {
  const product = products.value.find((p) => p.id === productId)
  if (product && product.quantity !== 0) {
    if (
      confirm(
        `Are you sure you want to remove ${product.name} from stock? This will set its quantity to 0.`,
      )
    ) {
      product.quantity = 0
    }
  }
}

// Function to remove all expired products from stock
function removeAllExpired() {
  if (
    confirm(
      'Are you sure you want to remove all expired products from stock? This will set their quantities to 0.',
    )
  ) {
    expiredProducts.value.forEach((product) => {
      if (product.quantity !== 0) {
        product.quantity = 0
      }
    })
  }
}

// --- Discount functionality for expiring products --- //

// Reactive object to store discount values keyed by product id.
const discountValues = ref({})

// Function to apply discount to a product that is expiring soon.
// It updates the sellingPrice based on the entered discount percentage.
function applyDiscount(productId) {
  const discount = parseFloat(discountValues.value[productId])
  if (isNaN(discount) || discount < 0 || discount > 100) {
    alert('Please enter a valid discount percentage (0-100)')
    return
  }
  const product = products.value.find((p) => p.id === productId)
  if (product) {
    // Apply discount on current sellingPrice.
    // (Note: This directly updates the sellingPrice. In a real app, consider storing original prices separately.)
    product.sellingPrice = parseFloat((product.sellingPrice * (1 - discount / 100)).toFixed(2))
    alert(
      `Discount of ${discount}% applied to ${product.name}. New price: ${product.sellingPrice}/-`,
    )
  }
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
          <tr v-for="product in expiredProducts" :key="product.id">
            <td>{{ product.name }}</td>
            <td>{{ product.quantity }}</td>
            <td>{{ product.expiryDate }}</td>
            <td>{{ Math.floor((now - new Date(product.expiryDate)) / (1000 * 60 * 60 * 24)) }}</td>
            <td>
              <button @click="removeFromStock(product.id)" :disabled="product.quantity === 0">
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
            <th>Discount (%)</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in expiringProducts" :key="product.id">
            <td>{{ product.name }}</td>
            <td>{{ product.quantity }}</td>
            <td>{{ product.expiryDate }}</td>
            <td>{{ Math.floor((new Date(product.expiryDate) - now) / (1000 * 60 * 60 * 24)) }}</td>
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
