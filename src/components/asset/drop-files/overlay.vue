<template>
<article class="overlay">
  <div v-if="props.processing" class="uploading">
    <span class="animation">
      <Loading/>
    </span>
    <h1 class="title">{{processingTitle}}</h1>
    <p class="description">{{$percent}}%</p>
  </div>
  <div v-else class="ready">
    <i><Icon name="file-up"/></i>
    <h1>여기에 파일 드롭</h1>
    <p>
      파일을 여기로 드래그 앤 드롭하거나 클릭하여 업로드하세요.<br/>
      용량은 {{$limitFileSize}}까지 업로드할 수 있습니다.
    </p>
  </div>
</article>
</template>

<script setup>
import { computed } from 'vue'
import { authStore } from '../../../store/auth.js'
import { getByte } from '../../../libs/strings.js'
import Icon from '../../icons/index.vue'
import Loading from '../../asset/loading/index.vue'

const auth = authStore()
const props = defineProps({
  processing: Boolean,
  processingTitle: { type: String, default: '업로드중..' },
  total: Number,
  current: Number,
})

const $limitFileSize = computed(() => {
  return getByte(auth.user?.json?.asset?.file_mainLimitSize || 10485760)
})
const $percent = computed(() => {
  return ((props.current / props.total) * 100).toFixed(1)
})
</script>

<style src="./overlay.scss" lang="scss" scoped></style>
