import '@testing-library/jest-dom/vitest'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach } from 'vitest'

/**
 * Many SFCs (e.g. ShopProductsHeader) call useAuthStore() without passing a Pinia
 * instance into render(). A fresh active Pinia per test matches app usage.
 */
beforeEach(() => {
  setActivePinia(createPinia())
})
