<template>
  <ErrorApp v-if="error" v-bind="error"/>
  <component v-if="layout" :is="layout">
    <router-view/>
  </component>
  <router-view v-else/>
</template>

<script setup>
import { ref, computed, watch, onErrorCaptured } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { LayoutDefault } from './layouts'
import ErrorApp from './pages/error/500.vue'

const { DEV } = import.meta.env
const router = useRouter()
const route = useRoute()
const error = ref(undefined)

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

// router error
// router.onError(e => {
//   error.value = {
//     message: e.message,
//   }
// })

// watch route name
// watch(() => route.name, () => {
//   // 오류난 화면에서 뒤로가기나 다른페이지로 이동했을때 오류값 초기화하기
//   if (!!error.value) error.value = undefined
// })
</script>
