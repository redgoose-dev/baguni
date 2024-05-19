import { createRouter, createWebHistory } from 'vue-router'
import { authStore } from '../store/auth.js'
import map from './map.js'

const { VITE_URL_PATH } = import.meta.env

const router = createRouter({
  history: createWebHistory(VITE_URL_PATH || '/'),
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
  // check API 호출
  const isAuth = await auth.check()
  // 상황을 판단하여 이후의 행동을 실행한다.
  if (to.name === 'login')
  {
    return isAuth ? '/' : undefined
  }
  else
  {
    return isAuth ? undefined : 'login'
  }
})

// route hook - after
// router.afterEach((to, from) => {
//   console.log('afterEach()')
// })

export default router
