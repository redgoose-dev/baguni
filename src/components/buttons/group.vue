<template>
<nav :class="[
  'button-group',
  props.size && `button-group--${props.size}`,
]">
  <slot/>
</nav>
</template>

<script setup>
const props = defineProps({
  size: String, // small,big
})
</script>

<style lang="scss" scoped>
@use '../../assets/scss/mixins';
.button-group {
  --button-group-height: var(--size-form-height-normal);
  --button-group-radius: calc(var(--button-group-height) * .5);
  display: flex;
  align-items: center;
  gap: .5px;
  height: var(--button-group-height);
  border-radius: var(--button-group-radius);
  box-shadow:
    inset 0 0 0 .5px var(--button-shadow-line, hsla(0 0% 0% / 0%)),
    0 2px 8px var(--button-shadow-1, hsla(0 0% 0% / 8%)),
    0 8px 24px var(--button-shadow-2, hsla(0 0% 0% / 12%));
  :slotted(.button) {
    border-radius: 0;
    box-shadow: none;
    height: 100%;
    &:first-child {
      border-top-left-radius: var(--button-group-radius);
      border-bottom-left-radius: var(--button-group-radius);
    }
    &:last-child {
      border-top-right-radius: var(--button-group-radius);
      border-bottom-right-radius: var(--button-group-radius);
    }
    &:focus-visible {
      outline: 2px solid var(--button-focus-color, unset);
      outline-offset: -2px;
    }
  }
  &:deep(.context-dropdown .trigger > .button) {
    border-radius: 0;
    box-shadow: none;
  }
  &:deep(.context-dropdown:first-child .trigger > .button) {
    border-top-left-radius: var(--button-group-radius);
    border-bottom-left-radius: var(--button-group-radius);
  }
  &:deep(.context-dropdown:last-child .trigger > .button) {
    border-top-right-radius: var(--button-group-radius);
    border-bottom-right-radius: var(--button-group-radius);
  }

  // size
  &--small {
    --button-group-height: var(--size-form-height-small);
  }
  &--big {
    --button-group-height: var(--size-form-height-big);
  }
}
</style>
