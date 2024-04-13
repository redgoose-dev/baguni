<template>
<input
  ref="$root"
  type="range"
  :name="props.name"
  :id="props.id"
  :value="props.modelValue"
  :disabled="props.disabled"
  :min="props.min"
  :max="props.max"
  :step="props.step"
  :class="[
    'slider',
    vertical && 'slider--vertical',
  ]"
  @input="onChange"/>
</template>

<script setup>
import { ref } from 'vue'

const $root = ref()
const props = defineProps({
  name: String,
  id: String,
  modelValue: Number,
  disabled: Boolean,
  step: Number,
  min: Number,
  max: Number,
  list: Array,
  vertical: Boolean,
})
const emits = defineEmits([ 'update:modelValue' ])

function focus()
{
  $root.value.focus()
}

function onChange(e)
{
  emits('update:modelValue', Number(e.target.value))
}

defineExpose({ focus })
</script>

<style lang="scss" scoped>
@use '../../assets/scss/mixins';
.slider {
  display: block;
  appearance: none;
  width: var(--slider-width, unset);
  height: var(--slider-height, 4px);
  background-color: var(--slider-color, var(--color-forms-outline));
  border-radius: calc(var(--slider-height, 4px) * .5);
  outline: 2px solid mixins.mix-alpha(var(--color-key-1), 0%);
  outline-offset: 2px;
  &:focus-visible {
    outline-color: var(--color-key-1);
  }
  &:not(:disabled):active {
    --slider-ball-stroke-color: var(--color-key-1);
  }
  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
    user-select: none;
  }
  @each $property in '-webkit-slider-thumb', '-moz-range-thumb' {
    &::#{$property} {
      position: relative;
      appearance: none;
      width: var(--slider-ball-size, 14px);
      height: var(--slider-ball-size, 14px);
      background-color: var(--slider-ball-color, var(--color-light));
      border-radius: 50%;
      box-shadow:
        inset 0 0 0 #{var(--slider-ball-stroke, 3px)} var(--slider-ball-stroke-color, var(--color-base)),
        0 1px 4px hsla(0 0% 0% / 50%);
      box-sizing: border-box;
    }
    &:not(:disabled)::#{$property} {
      cursor: pointer;
    }
  }
}
.slider--vertical {
  writing-mode: vertical-lr;
  width: var(--slider-width, 4px);
  height: var(--slider-height, unset);
}
</style>
