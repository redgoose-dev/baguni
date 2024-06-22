<template>
<article class="error">
  <div class="error-content">
    <figure>
      <img src="../../assets/images/img-error@2x.webp" width="640" height="640" alt="" draggable="false"/>
    </figure>
    <h1>{{props.title}}</h1>
    <code>Code: {{$code}}</code>
    <p>{{$message}}</p>
    <nav v-if="$useHomeButton">
      <div>
        <ButtonBasic href="/" color="key-1" right-icon="chevron-right" size="big">
          첫 페이지로 가기
        </ButtonBasic>
      </div>
    </nav>
  </div>
</article>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import ButtonBasic from '../../components/buttons/button-basic.vue'

const { DEV } = import.meta.env
const route = useRoute()
const props = defineProps({
  title: { type: String, default: '앗! 오류가 발생했어요!' },
  error: Error,
})

const $message = computed(() => {
  if (DEV) return props.error?.message || '알 수 없는 문제가 발생했습니다.'
  return '서버에 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.'
})
const $code = computed(() => {
  return props.error?.code || 500
})
const $useHomeButton = computed(() => {
  const ignoreRouteName = [ 'share-detail' ]
  return !ignoreRouteName.includes(route.name)
})
</script>

<style src="./error.scss" lang="scss" scoped></style>
