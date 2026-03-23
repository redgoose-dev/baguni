<template>
<nav :class="[
  'switch',
  props.disabled && 'switch--disabled',
  props.readonly && 'switch--readonly',
  `switch--${props.size}`,
]">
  <label v-if="_label.left" :for="props.id" class="switch-label">
    {{_label.left}}
  </label>
  <span class="switch-body">
    <input
      v-if="isCheck"
      type="checkbox"
      :checked="_sw"
      :name="props.name"
      :id="props.id"
      :required="props.required"
      :disabled="props.disabled || props.readonly"
      class="trigger"
      @change="onChangeInput">
    <button
      v-else
      type="button"
      :id="props.id"
      :data-checked="_sw"
      :disabled="props.disabled || props.readonly"
      class="trigger"
      @click="onChangeButton">
      {{props.name}}
    </button>
    <i class="handle"/>
  </span>
  <label v-if="_label.right" :for="props.id" class="switch-label">
    {{_label.right}}
  </label>
</nav>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: String,
  id: String,
  values: Array, // [false,true]
  disabled: Boolean,
  readonly: Boolean,
  required: Boolean,
  type: String, // check
  size: String, // small,big
  label: [ String, Array ],
})
const sw = defineModel({
  type: [ String, Number, Boolean ],
  default: false,
})
const isCheck = computed(() => props.type === 'check')
const _sw = computed(() => {
  if (props.values?.length > 1)
  {
    return sw.value === props.values[1]
  }
  else
  {
    return Boolean(sw.value)
  }
})
const _label = computed(() => {
  return Array.isArray(props.label) ? {
    left: props.label[0],
    right: props.label[1],
  } : {
    right: props.label,
  }
})

function onChangeInput(e)
{
  update(Boolean(e.target.checked))
}

function onChangeButton()
{
  update(!_sw.value)
}

function update(value)
{
  sw.value = (props.values?.length > 1) ? props.values[value ? 1 : 0] : value
}
</script>

<style src="./switch.scss" lang="scss" scoped></style>
