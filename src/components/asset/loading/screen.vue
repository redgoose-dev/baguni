<template>
<div class="page-loading">
  <Loading/>
</div>
</template>

<script setup>
import Loading from './index.vue'
</script>

<style lang="scss" scoped>
.page-loading {
  display: grid;
  place-content: center;
  min-height: 24vw;
}
</style>
