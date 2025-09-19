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
  grid-template-areas: 'left center right';
  align-items: center;
  > div {
    display: flex;
    gap: 0 8px;
  }
  &__left {
    grid-area: left;
    place-self: start;
  }
  &__center {
    grid-area: center;
    place-self: center;
  }
  &__right {
    grid-area: right;
    place-self: end;
  }
}
</style>
