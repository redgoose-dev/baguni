<template>
<nav class="bottom-nav">
  <div v-if="$slots.left" class="bottom-nav__left">
    <slot name="left"/>
  </div>
  <div v-if="$slots.center" class="bottom-nav__center">
    <slot name="center"/>
  </div>
  <div v-if="$slots.right" class="bottom-nav__right">
    <slot name="right"/>
  </div>
</nav>
</template>

<script setup>
</script>

<style lang="scss" scoped>
.bottom-nav {
  display: grid;
  grid-template-areas: 'bottom-left bottom-center bottom-right';
  align-items: center;
  > div {
    display: flex;
    gap: 0 8px;
  }
  &__left {
    grid-area: bottom-left;
    place-self: center;
    justify-self: start;
  }
  &__center {
    grid-area: bottom-center;
    place-self: center;
    justify-self: center;
  }
  &__right {
    grid-area: bottom-right;
    place-self: center;
    justify-self: end;
  }
}
</style>
