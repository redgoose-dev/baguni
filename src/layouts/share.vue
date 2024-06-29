<template>
<div class="layout">
  <slot/>
</div>
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  document.querySelector('html').classList.add('share')
})
</script>

<style src="./share.scss" lang="scss" scoped></style>
<style lang="scss">
html.share > body > .rg-toast {
  --size-header-height: 0px;
}
</style>
