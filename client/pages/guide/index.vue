<template>
<article class="guide">
  <div class="guide__wrap">
    <div class="guide__header">
      <Header/>
    </div>
    <div class="guide__container">
      <div class="contents">
        <router-view v-if="isChildren"/>
        <Introduce v-else/>
      </div>
    </div>
  </div>
</article>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Header from './header.vue'
import Introduce from './introduce.vue'

const route = useRoute()

const isChildren = computed(() => {
  if (route.matched.length <= 1) return false
  return route.matched[1].name === route.name
})
</script>

<style src="./index.scss" lang="scss" scoped></style>
