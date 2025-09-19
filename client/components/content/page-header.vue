<template>
<header class="page-header">
  <div class="page-header__body">
    <h1>{{props.title}}</h1>
    <p v-if="$slots.default">
      <slot/>
    </p>
  </div>
  <aside v-if="$slots.side" class="page-header__side">
    <slot name="side"/>
  </aside>
</header>
</template>

<script setup>
const props = defineProps({
  title: String,
})
</script>

<style lang="scss" scoped>
.page-header {
  display: flex;
  gap: 0 32px;
  align-items: center;
  user-select: none;
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
  &__body {
    min-width: 0;
    flex: 1;
  }
  &__side {}
}
</style>
