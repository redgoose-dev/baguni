<template>
<nav :class="[
  'radio-button',
  props.disabled && 'disabled',
  props.size && `size--${props.size}`,
  props.onlyIcon && 'icon',
]">
  <label
    v-for="(item, key) in props.options"
    type="button">
    <input
      type="radio"
      :id="key === 0 ? props.id : undefined"
      :name="props.name"
      :value="item.value"
      :checked="props.modelValue === item.value"
      @change="emits('update:modelValue', $event.target.value)">
    <span>
      <Icon v-if="item.icon" :name="item.icon"/>
      <em>{{item.label}}</em>
    </span>
  </label>
</nav>
</template>

<script setup>
import Icon from '../../components/icons/index.vue'

const props = defineProps({
  name: { type: String, required: true },
  id: String,
  options: { type: Array, required: true },
  modelValue: [ String, Number, Boolean ],
  disabled: Boolean,
  onlyIcon: Boolean,
  size: String, // small,big
})
const emits = defineEmits([ 'update:modelValue' ])
</script>

<style src="./radio-button.scss" lang="scss" scoped></style>
