<script setup>
import { ref, computed } from 'vue'
import { useProducts } from '@/composables/useProducts'
import { usePurchases } from '@/composables/usePurchases'
import api from '@/api' // Axios instance

// Get products and a method to refresh products from the backend
const { products, refreshProducts } = useProducts()
// Get the addPurchase function from the purchases composable (which makes a POST API call)
const { addPurchase } = usePurchases()

// For product search
const searchQuery = ref('')

// Bill items (each item contains the product and the purchase quantity)
const billItems = ref([])

// Computed property to filter products based on the search query
const filteredProducts = computed(() => {
  if (searchQuery.value.trim() === '') return products.value
  return products.value.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
  )
})

// Add a product to the bill (if already added, increase quantity by 1)
function addToBill(product) {
  const prodId = product.id || product._id
  if (product.quantity === 0) {
    alert(`${product.name} is out of stock`)
    return
  }
  const existingItem = billItems.value.find(
    (item) => (item.product.id || item.product._id) === prodId,
  )
  if (existingItem) {
    if (existingItem.quantity < product.quantity) {
      existingItem.quantity += 1
    } else {
      alert(`No more ${product.name} available`)
    }
  } else {
    billItems.value.push({ product, quantity: 1 })
  }
}

// Remove a product from the bill
function removeFromBill(productId) {
  billItems.value = billItems.value.filter(
    (item) => (item.product.id || item.product._id) !== productId,
  )
}

// Update stock for each product in the bill via API calls
async function updateStockForBill() {
  for (const item of billItems.value) {
    const prod = item.product
    const prodId = prod.id || prod._id
    const newQuantity = Math.max(prod.quantity - item.quantity, 0)
    try {
      await api.patch(`/products/${prodId}`, { quantity: newQuantity })
      // Update local state after successful API update
      prod.quantity = newQuantity
    } catch (err) {
      console.error(`Error updating product ${prodId}:`, err)
    }
  }
}

// --- Modal for Purchase Details --- //
const showPurchaseModal = ref(false)
const purchaseDetails = ref({
  customerName: '',
  phone: '',
  overallDiscount: '', // overall discount in percentage
})

// Computed original total (without discount)
const originalTotal = computed(() => {
  return billItems.value.reduce((sum, item) => sum + item.product.sellingPrice * item.quantity, 0)
})

// Computed final total (after applying overall discount)
// Clamp discount between 0 and 100.
const finalTotal = computed(() => {
  let discount = parseFloat(purchaseDetails.value.overallDiscount)
  if (isNaN(discount) || discount < 0) discount = 0
  if (discount > 100) discount = 100
  return originalTotal.value * (1 - discount / 100)
})

// Function to confirm purchase from modal
async function confirmPurchase() {
  if (!purchaseDetails.value.customerName.trim()) {
    alert('Please enter customer name')
    return
  }
  if (!purchaseDetails.value.phone.trim()) {
    alert('Please enter phone number')
    return
  }

  let discount = parseFloat(purchaseDetails.value.overallDiscount)
  if (isNaN(discount) || discount < 0) discount = 0
  if (discount > 100) discount = 100

  // Update stock for each bill item via API call
  await updateStockForBill()

  // Create purchase record with valid ISO date for purchaseDate
  const purchaseRecord = {
    customerName: purchaseDetails.value.customerName,
    phone: purchaseDetails.value.phone,
    purchaseDate: new Date().toISOString(), // Use ISO format
    items: JSON.parse(JSON.stringify(billItems.value)), // deep copy
    actualPrice: originalTotal.value.toFixed(2),
    overallDiscount: discount,
    finalPrice: finalTotal.value.toFixed(2),
    total: finalTotal.value.toFixed(2),
  }

  try {
    await addPurchase(purchaseRecord)
    // Optionally refresh products from the backend after purchase
    await refreshProducts()
    // Clear bill items and purchase details, then hide modal
    billItems.value = []
    purchaseDetails.value = { customerName: '', phone: '', overallDiscount: '' }
    showPurchaseModal.value = false
    alert('Purchase completed successfully!')
  } catch (err) {
    alert('Error completing purchase: ' + err.message)
  }
}

// When "Complete Purchase" is clicked, show the modal
function completePurchase() {
  if (billItems.value.length === 0) {
    alert('No products in the bill')
    return
  }
  showPurchaseModal.value = true
}
</script>

<template>
  <div class="new-bill-container">
    <!-- Left Section: Product Search & List -->
    <div class="left-section">
      <h2>Product Search</h2>
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Search products..."
        class="search-input"
      />
      <div class="product-list">
        <div
          class="product-card"
          v-for="product in filteredProducts"
          :key="product.id || product._id"
        >
          <img :src="product.image" :alt="product.name" />
          <div class="details">
            <h3>{{ product.name }}</h3>
            <p>Price: {{ product.sellingPrice }}/-</p>
            <p>Available: {{ product.quantity }}</p>
          </div>
          <button @click="addToBill(product)">Add to Bill</button>
        </div>
      </div>
    </div>

    <!-- Right Section: Bill Summary -->
    <div class="right-section">
      <h2>Bill</h2>
      <div v-if="billItems.length === 0">
        <p>No products added yet.</p>
      </div>
      <div v-else>
        <table class="bill-table">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Quantity</th>
              <th>Price (each)</th>
              <th>Total</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in billItems" :key="item.product.id || item.product._id">
              <td>{{ item.product.name }}</td>
              <td>
                <input
                  type="number"
                  v-model.number="item.quantity"
                  min="1"
                  :max="item.product.quantity"
                />
              </td>
              <td>{{ item.product.sellingPrice }}/-</td>
              <td>{{ (item.product.sellingPrice * item.quantity).toFixed(2) }}/-</td>
              <td>
                <button @click="removeFromBill(item.product.id || item.product._id)">Remove</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="bill-summary">
          <h3>Total: {{ originalTotal.toFixed(2) }}/-</h3>
          <button class="complete-purchase-btn" @click="completePurchase">Complete Purchase</button>
        </div>
      </div>
    </div>

    <!-- Purchase Details Modal -->
    <div v-if="showPurchaseModal" class="modal-overlay">
      <div class="modal-content">
        <h2>Enter Purchase Details</h2>
        <!-- Display Actual (Original) Price -->
        <div class="form-row">
          <label>Actual Price:</label>
          <span>{{ originalTotal.toFixed(2) }}/-</span>
        </div>
        <div class="form-row">
          <label>Customer Name:</label>
          <input type="text" v-model="purchaseDetails.customerName" placeholder="Customer Name" />
        </div>
        <div class="form-row">
          <label>Phone Number:</label>
          <input type="text" v-model="purchaseDetails.phone" placeholder="Phone Number" />
        </div>
        <div class="form-row">
          <label>Overall Discount (%):</label>
          <input
            type="number"
            v-model="purchaseDetails.overallDiscount"
            placeholder="Discount"
            min="0"
            max="100"
          />
        </div>
        <!-- Show Final Price live in the modal -->
        <div class="form-row">
          <label>Final Price:</label>
          <span>{{ finalTotal.toFixed(2) }}/-</span>
        </div>
        <div class="form-row buttons">
          <button @click="confirmPurchase">Confirm Purchase</button>
          <button @click="showPurchaseModal = false" class="cancel-btn">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.new-bill-container {
  display: flex;
  gap: 20px;
  padding: 20px;
  background-color: #fafafa;
}

/* Left Section (Product Search & Products) */
.left-section {
  flex: 1;
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.left-section h2 {
  margin-bottom: 10px;
  color: #4a148c;
}

.search-input {
  width: 100%;
  padding: 10px;
  margin-bottom: 20px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.product-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.product-card {
  width: calc(50% - 20px);
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 10px;
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
  height: 200px;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 10px;
}

.product-card .details {
  text-align: center;
  margin-bottom: 10px;
}

.product-card button {
  padding: 8px 16px;
  background-color: #4a148c;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.product-card button:hover {
  background-color: #6a1b9a;
}

/* Right Section (Bill Summary) */
.right-section {
  flex: 1;
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.right-section h2 {
  margin-bottom: 10px;
  color: #4a148c;
}

.bill-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.bill-table th,
.bill-table td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: center;
}

.bill-table th {
  background-color: #f4f4f4;
}

.bill-table input[type='number'] {
  width: 60px;
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.bill-table button {
  padding: 5px 10px;
  background-color: #d32f2f;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.bill-table button:hover {
  background-color: #c62828;
}

.bill-summary {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-start;
}

.complete-purchase-btn {
  padding: 10px 20px;
  background-color: #4a148c;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.complete-purchase-btn:hover {
  background-color: #6a1b9a;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
}

.modal-content h2 {
  margin-bottom: 20px;
  color: #4a148c;
}

.form-row {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.form-row label {
  width: 140px;
  font-weight: bold;
}

.form-row input,
.form-row select {
  flex: 1;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.form-row.buttons {
  justify-content: flex-end;
  gap: 10px;
}

.form-row.buttons button {
  padding: 10px 20px;
  background-color: #4a148c;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.form-row.buttons button:hover {
  background-color: #6a1b9a;
}

.form-row.buttons .cancel-btn {
  background-color: #9e9e9e;
}

.form-row.buttons .cancel-btn:hover {
  background-color: #757575;
}
</style>
