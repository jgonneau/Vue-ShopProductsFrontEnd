import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../modules/public-catalog/pages/HomePage.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage,
    },
  ],
})
