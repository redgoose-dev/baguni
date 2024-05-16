import { createRouter, createWebHistory } from 'vue-router'
import map from './map'

const { VITE_BASE_PATH } = import.meta.env

const router = createRouter({
  history: createWebHistory(VITE_BASE_PATH || '/'),
  routes: map,
  scrollBehavior(to, from, savePosition)
  {
    if (savePosition) return savePosition
    window.scrollTo(0, 0)
  },
})

// route hook - before
router.beforeEach(async (to, _from) => {
  let isAuth = false
  // console.warn('route-hook:', to)
  if (to.name === 'login')
  {
    return undefined
  }
  // TODO: 인증 검사를 한다.
  isAuth = true // 인증이 되었다면 `true`로 바꾼다.
  if (!isAuth) return 'login'
})

// route hook - after
// router.afterEach((to, from) => {
//   console.log('afterEach()')
// })

export default router
