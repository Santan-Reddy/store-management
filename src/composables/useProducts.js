import { ref, watch } from 'vue'
import initialProducts from '@/data/products.json'

const STORAGE_KEY = 'productsData'

export function useProducts() {
  const products = ref([])

  const storedProducts = localStorage.getItem(STORAGE_KEY)
  if (storedProducts) {
    try {
      products.value = JSON.parse(storedProducts)
    } catch (error) {
      console.error('Error parsing stored products, using initial data', error)
      products.value = initialProducts
    }
  } else {
    products.value = initialProducts
  }

  watch(
    products,
    (newProducts) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProducts))
    },
    { deep: true },
  )

  return { products }
}
