<template>
<nav class="button-group">
  <slot/>
</nav>
</template>

<script setup>
</script>

<style lang="scss" scoped>
.button-group {
  display: flex;
  align-items: center;
  gap: .5px;
  box-shadow:
    inset 0 0 0 .5px var(--button-shadow-line, hsla(0 0% 0% / 0%)),
    0 2px 8px var(--button-shadow-1, hsla(0 0% 0% / 8%)),
    0 8px 24px var(--button-shadow-2, hsla(0 0% 0% / 12%));
  overflow: clip;
  border-radius: calc(var(--button-height, 36px) * .5);
  & :slotted(.button) {
    border-radius: 0;
    box-shadow: none;
    &:nth-child(n+2) {
      border-left: .5px solid color-mix(in hsl, var(--color-base), transparent 50%);
    }
  }
}
</style>
