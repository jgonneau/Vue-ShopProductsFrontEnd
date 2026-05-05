import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../modules/auth/stores/auth-store'
import HomePage from '../modules/public-catalog/pages/HomePage.vue'
import LoginPage from '../modules/auth/pages/LoginPage.vue'
import RegisterPage from '../modules/auth/pages/RegisterPage.vue'
import ProfilePage from '../modules/auth/pages/ProfilePage.vue'
import AdminDashboardPage from '../modules/auth/pages/AdminDashboardPage.vue'
import VendorDashboardPage from '../modules/auth/pages/VendorDashboardPage.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginPage,
      meta: {
        guestOnly: true,
      },
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterPage,
      meta: {
        guestOnly: true,
      },
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfilePage,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/admin',
      name: 'admin-dashboard',
      component: AdminDashboardPage,
      meta: {
        requiresAuth: true,
        roles: ['admin'],
      },
    },
    {
      path: '/vendor',
      name: 'vendor-dashboard',
      component: VendorDashboardPage,
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

  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { name: 'profile' }
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
