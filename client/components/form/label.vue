<template>
<label :class="[
  'label',
  props.disabled && `label--disabled`,
  props.size && `label--${props.size}`,
]">
  <slot/>
  <span>{{props.name}}</span>
</label>
</template>

<script setup>
const props = defineProps({
  name: String,
  disabled: Boolean,
  size: String, // small
})
</script>

<style lang="scss" scoped>
@use '../../assets/scss/mixins';
.label {
  display: flex;
  align-items: center;
  gap: 0 6px;
  line-height: 1.05;
  span {
    display: block;
    font-size: var(--label-font-size, 15px);
    cursor: pointer;
    font-weight: 500;
  }
}
// disabled
.label--disabled {
  user-select: none;
  span {
    color: mixins.mix-alpha(var(--color-base), 50%);
    cursor: not-allowed;
  }
}
// size
.label--small {
  span {
    --label-font-size: 13px;
  }
}
</style>
