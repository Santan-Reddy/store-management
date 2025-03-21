<script setup>
import { ref } from 'vue'
import { useProducts } from '@/composables/useProducts'

const { products } = useProducts()

// --- Existing Products Update --- //
const updateQuantities = ref({})
const updateExpiryDates = ref({})
const updateRacks = ref({})
const updateRows = ref({})

function updateStock(productId) {
  const newQty = parseInt(updateQuantities.value[productId])
  if (isNaN(newQty)) {
    alert('Please enter a valid number for quantity')
    return
  }

  const newExpiry = updateExpiryDates.value[productId]
  if (!newExpiry || newExpiry.trim() === '') {
    alert('Please enter a valid expiry date')
    return
  }

  const newRack = updateRacks.value[productId]
  if (!newRack || newRack.trim() === '') {
    alert('Please enter a valid rack value')
    return
  }

  const newRow = updateRows.value[productId]
  if (!newRow || newRow.trim() === '') {
    alert('Please enter a valid row value')
    return
  }

  const product = products.value.find((p) => p.id === productId)
  if (product) {
    product.quantity = newQty
    product.expiryDate = newExpiry
    product.location.rack = newRack
    product.location.row = newRow

    // Optionally update the inputs to show the new values.
    updateQuantities.value[productId] = newQty
    updateExpiryDates.value[productId] = newExpiry
    updateRacks.value[productId] = newRack
    updateRows.value[productId] = newRow
  }
}

// --- New Product Modal --- //
const showModal = ref(false)

// Define category options for the dropdown.
const categoryOptions = [
  'Fruits',
  'Dairy',
  'Bakery',
  'Beverages',
  'Meat',
  'Snacks',
  'Vegetables',
  'Breakfast Cereals',
  'Grains',
  'Pasta',
  'Oils',
  'Condiments',
  'Confectionery',
  'Frozen Foods',
]

// New product object (soldCount is omitted from the form; set to 0 by default)
const newProduct = ref({
  name: '',
  quantity: '',
  image: '',
  mrp: '',
  sellingPrice: '',
  expiryDate: '',
  category: '',
  location: {
    rack: '',
    row: '',
  },
})

function addNewProduct() {
  if (!newProduct.value.name.trim()) {
    alert('Please enter product name')
    return
  }
  const quantity = parseInt(newProduct.value.quantity)
  if (isNaN(quantity)) {
    alert('Please enter a valid quantity')
    return
  }
  const mrp = parseFloat(newProduct.value.mrp)
  if (isNaN(mrp)) {
    alert('Please enter a valid MRP')
    return
  }
  const sellingPrice = parseFloat(newProduct.value.sellingPrice)
  if (isNaN(sellingPrice)) {
    alert('Please enter a valid selling price')
    return
  }
  if (!newProduct.value.expiryDate) {
    alert('Please enter a valid expiry date')
    return
  }
  if (!newProduct.value.category.trim()) {
    alert('Please select a category')
    return
  }
  if (!newProduct.value.location.rack.trim()) {
    alert('Please enter a valid rack')
    return
  }
  if (!newProduct.value.location.row.trim()) {
    alert('Please enter a valid row')
    return
  }
  // Generate a new id using Date.now()
  const newId = Date.now()
  const productToAdd = {
    id: newId,
    name: newProduct.value.name,
    quantity: quantity,
    soldCount: 0, // default value
    image: newProduct.value.image,
    mrp: mrp,
    sellingPrice: sellingPrice,
    expiryDate: newProduct.value.expiryDate,
    category: newProduct.value.category,
    location: {
      rack: newProduct.value.location.rack,
      row: newProduct.value.location.row,
    },
  }
  products.value.push(productToAdd)
  alert('Product added successfully!')
  // Reset the form and close modal
  newProduct.value = {
    name: '',
    quantity: '',
    image: '',
    mrp: '',
    sellingPrice: '',
    expiryDate: '',
    category: '',
    location: {
      rack: '',
      row: '',
    },
  }
  showModal.value = false
}
</script>

<template>
  <div class="update-stock-container">
    <h1>Update Stock</h1>

    <!-- Button to trigger New Product Modal -->
    <div class="add-product-btn-container">
      <button @click="showModal = true">Add New Product</button>
    </div>

    <!-- New Product Modal Pop-up -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <h2>Add New Product</h2>
        <div class="form-row">
          <label>Product Name:</label>
          <input type="text" v-model="newProduct.name" placeholder="Product Name" />
        </div>
        <div class="form-row">
          <label>Quantity:</label>
          <input type="number" v-model="newProduct.quantity" placeholder="Quantity" />
        </div>
        <div class="form-row">
          <label>Image URL:</label>
          <input type="text" v-model="newProduct.image" placeholder="Image URL" />
        </div>
        <div class="form-row">
          <label>MRP:</label>
          <input type="number" v-model="newProduct.mrp" placeholder="MRP" />
        </div>
        <div class="form-row">
          <label>Selling Price:</label>
          <input type="number" v-model="newProduct.sellingPrice" placeholder="Selling Price" />
        </div>
        <div class="form-row">
          <label>Expiry Date:</label>
          <input type="date" v-model="newProduct.expiryDate" />
        </div>
        <div class="form-row">
          <label>Category:</label>
          <select v-model="newProduct.category">
            <option value="" disabled>Select Category</option>
            <option v-for="option in categoryOptions" :key="option" :value="option">
              {{ option }}
            </option>
          </select>
        </div>
        <div class="form-row">
          <label>Rack:</label>
          <input type="text" v-model="newProduct.location.rack" placeholder="Rack" />
        </div>
        <div class="form-row">
          <label>Row:</label>
          <input type="text" v-model="newProduct.location.row" placeholder="Row" />
        </div>
        <div class="form-row buttons">
          <button @click="addNewProduct">Add Product</button>
          <button @click="showModal = false" class="cancel-btn">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Existing Products Update Table -->
    <table class="stock-table">
      <thead>
        <tr>
          <th>Product Name</th>
          <th>Current Quantity</th>
          <th>New Quantity</th>
          <th>New Expiry Date</th>
          <th>Current Rack</th>
          <th>New Rack</th>
          <th>Current Row</th>
          <th>New Row</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="product in products" :key="product.id">
          <td>{{ product.name }}</td>
          <td>{{ product.quantity }}</td>
          <td>
            <input
              type="number"
              v-model="updateQuantities[product.id]"
              :placeholder="product.quantity"
            />
          </td>
          <td>
            <input
              type="date"
              v-model="updateExpiryDates[product.id]"
              :placeholder="product.expiryDate"
            />
          </td>
          <td>{{ product.location.rack }}</td>
          <td>
            <input
              type="text"
              v-model="updateRacks[product.id]"
              :placeholder="product.location.rack"
            />
          </td>
          <td>{{ product.location.row }}</td>
          <td>
            <input
              type="text"
              v-model="updateRows[product.id]"
              :placeholder="product.location.row"
            />
          </td>
          <td>
            <button @click="updateStock(product.id)">Update</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.update-stock-container {
  padding: 20px;
  background-color: #fafafa;
}

.add-product-btn-container {
  margin-bottom: 20px;
  text-align: right;
}

.add-product-btn-container button {
  padding: 10px 20px;
  background-color: #4a148c;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.add-product-btn-container button:hover {
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
  width: 500px;
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
  width: 150px;
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

/* Existing Products Table */
.stock-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.stock-table th,
.stock-table td {
  border: 1px solid #ddd;
  padding: 12px;
  text-align: left;
}

.stock-table th {
  background-color: #f4f4f4;
  font-weight: bold;
}

.stock-table input[type='number'],
.stock-table input[type='date'],
.stock-table input[type='text'] {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.stock-table button {
  padding: 8px 16px;
  background-color: #4a148c;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.stock-table button:hover {
  background-color: #6a1b9a;
}
</style>
