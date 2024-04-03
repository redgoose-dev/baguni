<template>
<nav :class="[
  'radio-button',
  props.disabled && 'disabled',
  props.size && `size--${props.size}`,
  props.onlyIcon && 'icon',
]">
  <label
    v-for="item in props.options"
    type="button">
    <input
      type="radio"
      :name="props.name"
      :value="item.value"
      :checked="props.modelValue === item.value"
      @change="emits('update:modelValue', $event.target.value)">
    <span>
      <IconFeather v-if="item.icon" :name="item.icon"/>
      <em>{{item.label}}</em>
    </span>
  </label>
</nav>
</template>

<script setup>
import IconFeather from '../../components/icons/feather.vue'

const props = defineProps({
  name: { type: String, required: true },
  options: { type: Array, required: true },
  modelValue: [ String, Number, Boolean ],
  disabled: Boolean,
  onlyIcon: Boolean,
  size: String, // small,big
})
const emits = defineEmits([ 'update:modelValue' ])
</script>

<style src="./radio-button.scss" lang="scss" scoped></style>
