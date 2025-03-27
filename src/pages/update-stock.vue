<script setup>
import { ref, computed } from 'vue'
import { useProducts } from '@/composables/useProducts'
import api from '@/api'

const { products, refreshProducts } = useProducts()

// Search query for filtering products
const searchQuery = ref('')

// Computed property to filter products based on search query
const filteredProducts = computed(() => {
  if (!searchQuery.value.trim()) {
    return products.value
  }
  return products.value.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
  )
})

// --- Existing Products Update --- //
const updateQuantities = ref({})
const updateExpiryDates = ref({})
const updateRacks = ref({})
const updateRows = ref({})

// Update an existing product's stock details via backend API
async function updateStock(prodId) {
  const newQty = parseInt(updateQuantities.value[prodId])
  if (isNaN(newQty)) {
    alert('Please enter a valid number for quantity')
    return
  }

  const newExpiry = updateExpiryDates.value[prodId]
  if (!newExpiry || newExpiry.trim() === '') {
    alert('Please enter a valid expiry date')
    return
  }

  const newRack = updateRacks.value[prodId]
  if (!newRack || newRack.trim() === '') {
    alert('Please enter a valid rack value')
    return
  }

  const newRow = updateRows.value[prodId]
  if (!newRow || newRow.trim() === '') {
    alert('Please enter a valid row value')
    return
  }

  const product = products.value.find((p) => p.id === prodId || p._id === prodId)
  if (product) {
    const productId = product.id || product._id
    try {
      await api.patch(`/products/${productId}`, {
        quantity: newQty,
        expiryDate: newExpiry,
        location: { rack: newRack, row: newRow },
      })
      // Update local state after a successful API call
      product.quantity = newQty
      product.expiryDate = newExpiry
      product.location.rack = newRack
      product.location.row = newRow

      updateQuantities.value[prodId] = newQty
      updateExpiryDates.value[prodId] = newExpiry
      updateRacks.value[prodId] = newRack
      updateRows.value[prodId] = newRow
      alert(`${product.name} updated successfully!`)
    } catch (err) {
      alert('Error updating product: ' + err.message)
    }
  }
}

// Delete a product via backend API
async function deleteProduct(prodId) {
  const product = products.value.find((p) => p.id === prodId || p._id === prodId)
  if (!product) return
  const productId = product.id || product._id
  if (confirm(`Are you sure you want to delete ${product.name}?`)) {
    try {
      await api.delete(`/products/${productId}`)
      alert(`${product.name} deleted successfully!`)
      // Refresh the products list
      await refreshProducts()
    } catch (error) {
      alert('Error deleting product: ' + error.message)
    }
  }
}

// --- New Product Modal --- //
const showModal = ref(false)

// Predefined category options for the dropdown.
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

// New variable to capture a custom category when "Other" is selected.
const newCategoryInput = ref('')

// New product object (soldCount is omitted; default to 0)
const newProduct = ref({
  name: '',
  quantity: '',
  image: '',
  mrp: '',
  sellingPrice: '',
  costPrice: '', // New field for cost price
  expiryDate: '',
  category: '',
  location: {
    rack: '',
    row: '',
  },
})

async function addNewProduct() {
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
  const costPrice = parseFloat(newProduct.value.costPrice)
  if (isNaN(costPrice)) {
    alert('Please enter a valid cost price')
    return
  }
  // Validate that costPrice and sellingPrice are not more than MRP
  if (costPrice > mrp) {
    alert('Cost Price cannot be greater than MRP')
    return
  }
  if (sellingPrice > mrp) {
    alert('Selling Price cannot be greater than MRP')
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
  // If the user selects "Other", ensure a new category is provided.
  if (newProduct.value.category === 'Other') {
    if (!newCategoryInput.value.trim()) {
      alert('Please enter a new category')
      return
    }
    newProduct.value.category = newCategoryInput.value.trim()
  }
  if (!newProduct.value.location.rack.trim()) {
    alert('Please enter a valid rack')
    return
  }
  if (!newProduct.value.location.row.trim()) {
    alert('Please enter a valid row')
    return
  }
  // Generate a new id using Date.now() (or let backend generate one)
  const newId = Date.now()
  const productToAdd = {
    id: newId,
    name: newProduct.value.name,
    quantity: quantity,
    soldCount: 0, // default value
    image: newProduct.value.image,
    mrp: mrp,
    sellingPrice: sellingPrice,
    costPrice: costPrice, // include costPrice
    expiryDate: newProduct.value.expiryDate,
    category: newProduct.value.category,
    location: {
      rack: newProduct.value.location.rack,
      row: newProduct.value.location.row,
    },
  }
  try {
    await api.post('/products', productToAdd)
    alert('Product added successfully!')
    // Refresh the products list from backend
    await refreshProducts()
    // Reset the form and close modal
    newProduct.value = {
      name: '',
      quantity: '',
      image: '',
      mrp: '',
      sellingPrice: '',
      costPrice: '',
      expiryDate: '',
      category: '',
      location: {
        rack: '',
        row: '',
      },
    }
    newCategoryInput.value = ''
    showModal.value = false
  } catch (error) {
    alert('Error adding product: ' + error.message)
  }
}
// async function deleteProduct(prodId) {
//   try {
//     await api.delete(`/products/${prodId}`)
//     alert('Product deleted successfully!')
//     await refreshProducts()
//   } catch (error) {
//     alert('Error deleting product: ' + error.message)
//   }
// }
</script>

<template>
  <div class="update-stock-container">
    <h1>Update Stock</h1>

    <!-- Search Bar for filtering products -->
    <div class="search-bar">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search products..."
        class="search-input"
      />
    </div>

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
          <label>Cost Price:</label>
          <input type="number" v-model="newProduct.costPrice" placeholder="Cost Price" />
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
            <option value="Other">Other</option>
          </select>
        </div>
        <!-- Show new category input if "Other" is selected -->
        <div v-if="newProduct.category === 'Other'" class="form-row">
          <label>New Category:</label>
          <input type="text" v-model="newCategoryInput" placeholder="Enter new category" />
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
          <th>Delete</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="product in filteredProducts" :key="product.id || product._id">
          <td>{{ product.name }}</td>
          <td>{{ product.quantity }}</td>
          <td>
            <input
              type="number"
              v-model="updateQuantities[product.id || product._id]"
              :placeholder="product.quantity"
            />
          </td>
          <td>
            <input
              type="date"
              v-model="updateExpiryDates[product.id || product._id]"
              :placeholder="product.expiryDate"
            />
          </td>
          <td>{{ product.location.rack }}</td>
          <td>
            <input
              type="text"
              v-model="updateRacks[product.id || product._id]"
              :placeholder="product.location.rack"
            />
          </td>
          <td>{{ product.location.row }}</td>
          <td>
            <input
              type="text"
              v-model="updateRows[product.id || product._id]"
              :placeholder="product.location.row"
            />
          </td>
          <td>
            <button @click="updateStock(product.id || product._id)">Update</button>
          </td>
          <td>
            <button @click="deleteProduct(product.id || product._id)">Delete</button>
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

.search-bar {
  margin-bottom: 20px;
  text-align: right;
}

.search-input {
  width: 300px;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
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
