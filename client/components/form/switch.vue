<template>
<nav :class="[
  'switch',
  props.disabled && 'switch--disabled',
  props.readonly && 'switch--readonly',
  `switch--${props.size}`,
]">
  <label v-if="label.left" :for="props.id" class="switch-label">
    {{label.left}}
  </label>
  <span class="switch-body">
    <input
      v-if="isCheck"
      type="checkbox"
      :checked="sw"
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
      :data-checked="sw"
      :disabled="props.disabled || props.readonly"
      class="trigger"
      @click="onChangeButton">
      {{props.name}}
    </button>
    <i class="handle"/>
  </span>
  <label v-if="label.right" :for="props.id" class="switch-label">
    {{label.right}}
  </label>
</nav>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: String,
  id: String,
  modelValue: [ String, Number, Boolean ],
  values: Array, // [false,true]
  disabled: Boolean,
  readonly: Boolean,
  required: Boolean,
  type: String, // check
  size: String, // small,big
  label: [ String, Array ],
})
const emits = defineEmits([ 'update:modelValue' ])
const isCheck = computed(() => props.type === 'check')
const sw = computed(() => {
  if (props.values?.length > 1)
  {
    return props.modelValue === props.values[1]
  }
  else
  {
    return Boolean(props.modelValue)
  }
})
const label = computed(() => {
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
  update(!sw.value)
}

function update(sw)
{
  const value = (props.values?.length > 1) ? props.values[sw ? 1 : 0] : sw
  emits('update:modelValue', value)
}
</script>

<style src="./switch.scss" lang="scss" scoped></style>
