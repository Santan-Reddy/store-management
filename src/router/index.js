import { createRouter, createWebHistory } from 'vue-router'
import dashboard from '@/pages/dashboard.vue'
import search from '@/pages/search.vue'
import newBill from '@/pages/new-bill.vue'
import updateStock from '@/pages/update-stock.vue'
import expiredStock from '@/pages/expired-stock.vue'
import profile from '@/pages/profile.vue'
import updatePrice from '@/pages/update-price.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: dashboard,
    },
    {
      path: '/search',
      name: 'search',
      component: search,
    },
    {
      path: '/new-bill',
      name: 'new-bill',
      component: newBill,
    },
    {
      path: '/update-stock',
      name: 'update-stock',
      component: updateStock,
    },
    {
      path: '/expired-stock',
      name: 'expired-stock',
      component: expiredStock,
    },
    {
      path: '/update-price',
      name: 'update-price',
      component: updatePrice,
    },
    {
      path: '/profile',
      name: 'profile',
      component: profile,
    },
  ],
})

export default router
