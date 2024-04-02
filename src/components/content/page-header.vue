<template>
<header class="page-header">
  <h1>{{props.title}}</h1>
  <p v-if="$slots.default">
    <slot/>
  </p>
</header>
</template>

<script setup>
const props = defineProps({
  title: String,
})
</script>

<style lang="scss" scoped>
.page-header {
  h1 {
    margin: 0;
    font-size: 32px;
    letter-spacing: -1px;
    line-height: 1.05;
    font-weight: 800;
  }
  p {
    margin: 4px 0 0;
    font-size: 11px;
    line-height: 1.25;
    color: var(--color-weak);
  }
}
</style>
