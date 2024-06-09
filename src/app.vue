<template>
  <component v-if="layout" :is="layout">
    <ErrorApp v-if="errorData" :error="errorData"/>
    <router-view v-else/>
  </component>
  <router-view v-else/>
</template>

<script setup>
import { ref, computed, watch, onErrorCaptured } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AppError from './modules/AppError.js'
import { LayoutDefault } from './layouts'
import ErrorApp from './pages/error/500.vue'

const { DEV } = import.meta.env
const router = useRouter()
const route = useRoute()
const errorData = ref()

const layout = computed(() => {
  let layoutName = route.meta?.layout || 'blank'
  switch (layoutName)
  {
    case 'blank':
      return null
    default:
      return LayoutDefault
  }
})

// watch route name
watch(() => route.name, () => {
  // 오류난 화면에서 뒤로가기나 다른페이지로 이동했을때 오류값 초기화하기
  if (!!errorData.value) errorData.value = undefined
})

onErrorCaptured((e) => {
  if (typeof e === 'string') errorData.value = new AppError(String(e))
  else if (e instanceof Error || e instanceof AppError) errorData.value = e
  else errorData.value = new AppError('Unknown Error', 500)
})

// router error
// router.onError(e => {
//   error.value = {
//     message: e.message,
//   }
// })
</script>
