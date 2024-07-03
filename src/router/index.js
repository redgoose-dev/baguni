import { createRouter, createWebHistory } from 'vue-router'
import { authStore } from '../store/auth.js'
import map from './map.js'

const { VITE_LOCAL_PATH } = import.meta.env

const router = createRouter({
  history: createWebHistory(VITE_LOCAL_PATH || '/'),
  routes: map,
  scrollBehavior(to, from, savePosition)
  {
    if (savePosition) return savePosition
    window.scrollTo(0, 0)
  },
})

// route hook - before
router.beforeEach(async (to, from) => {
  const auth = authStore()
  // is login page
  if (to.name === 'login') return undefined
  // check API 호출
  const isAuth = await auth.check()
  // 상황을 판단하여 이후의 행동을 실행한다.
  if (to.name === 'share-detail') return true
  return isAuth ? undefined : 'login'
})

// route hook - after
// router.afterEach((to, from) => {
//   console.log('afterEach()')
// })

export default router
