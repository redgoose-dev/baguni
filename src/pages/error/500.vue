<template>
<article class="error">
  <div class="error-content">
    <figure class="error-image">
      <img src="../../assets/images/img-error@2x.webp" width="640" height="640" alt="" draggable="false"/>
    </figure>
    <div class="error-body">
      <h1>{{props.title}}</h1>
      <code>Code {{$code}}</code>
      <p>{{$message}}</p>
      <nav>
        <div>
          <ButtonBasic href="/" color="key-1" right-icon="chevron-right">
            첫 페이지로 가기
          </ButtonBasic>
        </div>
      </nav>
    </div>
  </div>
</article>
</template>

<script setup>
import { computed } from 'vue'
import ButtonBasic from '../../components/buttons/button-basic.vue'

// TODO: 라우터는 정상적으로 작동하지만 페이지 컴포넌트 내부에서 오류가 난 경우다.

const props = defineProps({
  title: { type: String, default: '앗! 오류가..' },
  message: String,
  code: Number,
})
const $message = computed(() => {
  return props.message
})
const $code = computed(() => {
  return props.code || 500
})
</script>

<style src="./error.scss" lang="scss" scoped></style>
