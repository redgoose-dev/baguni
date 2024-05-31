<template>
<nav :class="[
  'form-group',
  $slots.left && 'is-left',
  $slots.right && 'is-right',
  props.size && `form-group--${props.size}`,
]">
  <div v-if="$slots.left" class="side side--left">
    <slot name="left"/>
  </div>
  <slot/>
  <div v-if="$slots.right" class="side side--right">
    <slot name="right"/>
  </div>
</nav>
</template>

<script setup>
const props = defineProps({
  size: String, // small
})
</script>

<style lang="scss" scoped>
@use '../../assets/scss/mixins';

.form-group {
  --form-group-height: var(--size-form-height-normal);
  --form-group-radius: var(--size-form-radius);
  display: grid;
  align-items: center;
  height: var(--form-group-height);
  background: var(--form-group-bg, var(--color-bg));
  border-radius: var(--size-form-radius);
  :slotted(.input-text) {
    border-radius: 0;
    background: none;
    height: 100%;
  }
  :slotted(.button) {
    box-shadow: unset;
    border-radius: 0;
    height: 100%;
    padding: 0 16px;
  }
  &:is(.is-left) {
    grid-template-columns: auto 1fr;
  }
  &:is(.is-right) {
    grid-template-columns: 1fr auto;
  }
  &:is(.is-left.is-right) {
    grid-template-columns: auto 1fr auto;
  }
  > :slotted(:first-child) {
    border-top-left-radius: var(--size-form-radius);
    border-bottom-left-radius: var(--size-form-radius);
  }
  > :slotted(:last-child) {
    border-top-right-radius: var(--size-form-radius);
    border-bottom-right-radius: var(--size-form-radius);
  }
  // size
  &--small {
    --form-group-height: var(--size-form-height-small);
    :slotted(.button--small) {
      padding: 0 12px;
    }
  }
}
.side {
  display: flex;
  height: 100%;
  gap: 0 1px;
  &--left {
    :slotted(:first-child) {
      border-top-left-radius: var(--size-form-radius);
      border-bottom-left-radius: var(--size-form-radius);
    }
  }
  &--right {
    :slotted(:last-child) {
      border-top-right-radius: var(--size-form-radius);
      border-bottom-right-radius: var(--size-form-radius);
    }
  }
}
</style>
