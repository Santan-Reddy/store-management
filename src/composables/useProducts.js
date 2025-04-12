// src/composables/useProducts.js
import { ref, onMounted } from 'vue'
import api from '@/api'

export function useProducts() {
  const products = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Function to fetch products from the backend
  const fetchProducts = async () => {
    loading.value = true
    try {
      const response = await api.get('/products')
      products.value = response.data
    } catch (err) {
      error.value = err
      console.error('Error fetching products:', err)
    } finally {
      loading.value = false
    }
  }

  // Fetch products on component mount
  onMounted(fetchProducts)

  // Optionally, a function to refresh or update products after CRUD operations
  const refreshProducts = fetchProducts

  return { products, loading, error, refreshProducts }
}
