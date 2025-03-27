<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePurchases } from '@/composables/usePurchases'

// Destructure purchases and fetchPurchases from the composable
const { purchases, fetchPurchases } = usePurchases()

// Fetch purchases from backend when component mounts
onMounted(() => {
  fetchPurchases()
})

const selectedPurchase = ref(null)
const searchQuery = ref('')

// Filter purchases by customer name, purchase date, or phone number (case-insensitive)
const filteredPurchases = computed(() => {
  if (!searchQuery.value.trim()) return purchases.value
  const query = searchQuery.value.toLowerCase()
  return purchases.value.filter(
    (purchase) =>
      purchase.customerName.toLowerCase().includes(query) ||
      purchase.purchaseDate.toLowerCase().includes(query) ||
      (purchase.phone && purchase.phone.toLowerCase().includes(query)),
  )
})

function selectPurchase(purchase) {
  selectedPurchase.value = purchase
}
</script>

<template>
  <div class="profile-container">
    <!-- Left Panel: Recent Purchases List -->
    <div class="left-panel">
      <h2>Recent Purchases</h2>
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search by name, date, or phone..."
        class="search-input"
      />
      <ul class="purchase-list">
        <li
          v-for="purchase in filteredPurchases"
          :key="purchase.id"
          @click="selectPurchase(purchase)"
          :class="{ active: selectedPurchase && selectedPurchase.id === purchase.id }"
        >
          <p>
            <strong>{{ purchase.customerName }}</strong>
          </p>
          <p>{{ purchase.phone }}</p>
          <p>{{ purchase.purchaseDate }}</p>
        </li>
      </ul>
    </div>

    <!-- Right Panel: Selected Purchase Details -->
    <div class="right-panel">
      <h2>Purchase Details</h2>
      <div v-if="!selectedPurchase">
        <p>Select a purchase from the list to view details.</p>
      </div>
      <div v-else>
        <p><strong>Customer Name:</strong> {{ selectedPurchase.customerName }}</p>
        <p><strong>Phone Number:</strong> {{ selectedPurchase.phone }}</p>
        <p><strong>Purchase Date:</strong> {{ selectedPurchase.purchaseDate }}</p>
        <!-- New fields to show price details -->
        <p><strong>Actual Price:</strong> {{ selectedPurchase.actualPrice }}/-</p>
        <p><strong>Discount:</strong> {{ selectedPurchase.overallDiscount }}%</p>
        <p><strong>Final Price:</strong> {{ selectedPurchase.finalPrice }}/-</p>
        <table class="purchase-details-table">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Quantity</th>
              <th>Price (each)</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in selectedPurchase.items" :key="item.product.id">
              <td>{{ item.product.name }}</td>
              <td>{{ item.quantity }}</td>
              <td>{{ item.product.sellingPrice }}/-</td>
              <td>{{ (item.product.sellingPrice * item.quantity).toFixed(2) }}/-</td>
            </tr>
          </tbody>
        </table>
        <h3>Total: {{ selectedPurchase.total }}/-</h3>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-container {
  display: flex;
  gap: 20px;
  padding: 20px;
  background-color: #fafafa;
}

.left-panel {
  flex: 1;
  max-width: 300px;
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.left-panel h2 {
  margin-bottom: 10px;
  color: #4a148c;
}

.search-input {
  width: 100%;
  padding: 8px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.purchase-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.purchase-list li {
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.purchase-list li:hover,
.purchase-list li.active {
  background-color: #f4f4f4;
}

.right-panel {
  flex: 2;
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.right-panel h2 {
  margin-bottom: 10px;
  color: #4a148c;
}

.purchase-details-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
  margin-top: 10px;
}

.purchase-details-table th,
.purchase-details-table td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: center;
}

.purchase-details-table th {
  background-color: #f4f4f4;
}
</style>
