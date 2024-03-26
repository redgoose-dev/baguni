<template>
<div class="layout">
  <LayoutHeader/>
  <div class="container">
    <slot/>
  </div>
  <LayoutFooter/>
</div>
</template>

<script setup>
import LayoutHeader from '../components/layout/header.vue'
import LayoutFooter from '../components/layout/footer.vue'
</script>

<style src="./default.scss" lang="scss" scoped></style>
