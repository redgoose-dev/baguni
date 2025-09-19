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
    <h1><slot name="title"/></h1>
    <p><slot name="description"/></p>
  </div>
</article>
</template>

<script setup>
import { computed } from 'vue'
import Icon from '../../icons/index.vue'
import Loading from '../../asset/loading/index.vue'

const props = defineProps({
  processing: Boolean,
  processingTitle: { type: String, default: '업로드중..' },
  total: Number,
  current: Number,
})

const $percent = computed(() => {
  return ((props.current / props.total) * 100).toFixed(1)
})
</script>

<style src="./overlay.scss" lang="scss" scoped></style>
