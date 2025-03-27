// src/composables/usePurchases.js
import { ref } from 'vue'
import api from '@/api'

export function usePurchases() {
  const purchases = ref([])

  // Function to add a new purchase
  async function addPurchase(purchase) {
    try {
      const response = await api.post('/purchases', purchase)
      // Update local state if needed
      purchases.value.push(response.data)
    } catch (err) {
      console.error('Error adding purchase:', err)
    }
  }

  // Function to fetch purchases
  async function fetchPurchases() {
    try {
      const response = await api.get('/purchases')
      purchases.value = response.data
    } catch (err) {
      console.error('Error fetching purchases:', err)
    }
  }

  return { purchases, addPurchase, fetchPurchases }
}
