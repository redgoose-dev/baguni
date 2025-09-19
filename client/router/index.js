import { createRouter, createWebHistory } from 'vue-router'
import { authStore } from '../store/index.js'
import map from './map.js'

const router = createRouter({
  history: createWebHistory('/'),
  routes: map,
  scrollBehavior(to, from, savePosition)
  {
    if (savePosition) return savePosition
    window.scrollTo(0, 0)
  },
})

// route hook - before
router.beforeEach(async (to, _from) => {
  switch (to.name)
  {
    case 'login':
    case 'share-index':
      return true
    default:
      const auth = authStore()
      const checkAuth = await auth.checkin()
      return checkAuth ? undefined : '/login/'
  }
})

// route hook - after
// router.afterEach((to, from) => {
//   console.log('afterEach()')
// })

export default router
