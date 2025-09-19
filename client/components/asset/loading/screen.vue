<template>
<div :class="[ 'page-loading', show && 'visible' ]">
  <Loading/>
</div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import Loading from './index.vue'

let mounted = false
const show = ref(false)

onMounted(() => {
  mounted = true
  setTimeout(() => {
    if (mounted) show.value = true
  }, 240)
})
onUnmounted(() => {
  mounted = false
})
</script>

<style lang="scss" scoped>
.page-loading {
  display: grid;
  place-content: center;
  min-height: 24vw;
  opacity: 0;
  transition: opacity 280ms ease-out;
  box-sizing: border-box;
  &.visible {
    opacity: 1;
  }
}
</style>
