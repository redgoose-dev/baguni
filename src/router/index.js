import { createRouter, createWebHistory } from 'vue-router'
import map from './map'

const { VITE_BASE_URL } = import.meta.env

const router = createRouter({
  history: createWebHistory(VITE_BASE_URL || '/'),
  routes: map,
  scrollBehavior(to, from, savePosition)
  {
    if (savePosition) return savePosition
    window.scrollTo(0, 0)
  },
})

// route hook - before
router.beforeEach(async (to, _from) => {
  // console.warn('route-hook:', to)
  return undefined
})

// route hook - after
// router.afterEach((to, from) => {
//   console.log('afterEach()')
// })

export default router
