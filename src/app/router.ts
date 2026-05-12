import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../modules/auth/stores/auth-store'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../modules/shop-products/pages/ShopProductsHomePage.vue'),
    },
    {
      path: '/products',
      name: 'products',
      component: () => import('../modules/shop-products/pages/ShopProductsShopPage.vue'),
    },
    {
      path: '/products/:id',
      name: 'product-detail',
      component: () => import('../modules/public-catalog/pages/ProductDetailPage.vue'),
    },
    {
      path: '/stores',
      name: 'stores',
      component: () => import('../modules/public-catalog/pages/StoreListPage.vue'),
    },
    {
      path: '/stores/:id',
      name: 'store-detail',
      component: () => import('../modules/public-catalog/pages/StoreDetailPage.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../modules/auth/pages/LoginPage.vue'),
      meta: {
        guestOnly: true,
      },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../modules/auth/pages/RegisterPage.vue'),
      meta: {
        guestOnly: true,
      },
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../modules/auth/pages/ProfilePage.vue'),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/account/orders',
      name: 'customer-orders',
      component: () => import('../modules/shop-products/pages/ShopProductsOrdersPage.vue'),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/account/orders/:orderId',
      name: 'customer-order-detail',
      component: () => import('../modules/shop-products/pages/ShopProductsOrderDetailPage.vue'),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/account/invoices',
      name: 'customer-invoices',
      component: () => import('../modules/customer/pages/CustomerInvoicesPage.vue'),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/account/security',
      name: 'account-security',
      component: () => import('../modules/customer/pages/AccountSecurityPage.vue'),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/admin',
      name: 'admin-dashboard',
      component: () => import('../modules/shop-products/pages/ShopProductsAdminPage.vue'),
      meta: {
        requiresAuth: true,
        roles: ['admin'],
      },
    },
    {
      path: '/vendor',
      name: 'vendor-dashboard',
      component: () => import('../modules/auth/pages/VendorDashboardPage.vue'),
      meta: {
        requiresAuth: true,
        roles: ['vendor', 'admin'],
      },
    },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  await auth.initializeSession()

  if (to.name === 'home' && auth.isAuthenticated) {
    return { name: 'products' }
  }

  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { name: 'customer-orders' }
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return {
      name: 'login',
      query: {
        redirect: to.fullPath,
      },
    }
  }

  const allowedRoles = to.meta.roles as Array<'admin' | 'vendor' | 'customer' | 'guest'> | undefined
  if (allowedRoles && auth.userRole && !allowedRoles.includes(auth.userRole)) {
    return { name: 'home' }
  }

  return true
})
