import { ref } from 'vue'

const purchases = ref([])

function addPurchase(purchase) {
  purchases.value.push(purchase)
}

export function usePurchases() {
  return { purchases, addPurchase }
}
