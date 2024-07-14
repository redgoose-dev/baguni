<template>
  <ErrorApp v-if="errorData" :error="errorData"/>
  <component v-else-if="layout" :is="layout">
    <router-view/>
  </component>
  <router-view v-else/>
</template>

<script setup>
import { ref, computed, onErrorCaptured } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { LayoutDefault, LayoutShare } from './layouts'
import { authStore } from './store/auth.js'
import { userModes } from '../global/consts.js'
import AppError from './modules/AppError.js'
import ErrorApp from './pages/error/500.vue'

const router = useRouter()
const route = useRoute()
const auth = authStore()
const errorData = ref()

const layout = computed(() => {
  let layoutName = route.meta?.layout || 'blank'
  switch (layoutName)
  {
    case 'blank':
      return null
    case 'share':
      return LayoutShare
    default:
      return LayoutDefault
  }
})

onErrorCaptured((e) => {
  if (typeof e === 'string') errorData.value = new AppError(String(e))
  else if (e instanceof Error || e instanceof AppError) errorData.value = e
  else errorData.value = new AppError('Unknown Error', 500)
})

// router
router.onError(e => {
  errorData.value = new AppError('라우터 관련 오류가 발생했습니다.')
})
router.beforeEach((to, from) => {
  if (!!errorData.value) errorData.value = undefined
  checkAdminPage(!!to.meta.admin)
})

function checkAdminPage(isAdminPage)
{
  if (!isAdminPage) return
  if (auth.user?.mode === userModes.ADMIN) return
  errorData.value = new AppError('관리자만 접근할 수 있습니다.', 403)
}
</script>
