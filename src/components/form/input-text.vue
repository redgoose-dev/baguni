<template>
<input
  ref="$root"
  :type="props.type"
  :name="props.name"
  :id="props.id"
  :value="props.modelValue"
  :required="props.required"
  :disabled="props.disabled"
  :readonly="props.readonly"
  :placeholder="props.placeholder"
  :maxlength="props.maxlength"
  :min="props.min"
  :max="props.max"
  :step="props.step"
  :pattern="props.pattern"
  :list="props.list"
  :class="[
    'input-text',
    props.size && `input-text--${props.size}`,
    props.color && `input-text--${props.color}`,
  ]"
  @input="onChangeText"
  @click="onChangePosition"
  @keyup="onChangePosition"
  @keyup.enter="emits('submit')"
  @keydown.enter="emits('submit')"/>
</template>

<script setup>
import { ref } from 'vue'

const $root = ref()
const props = defineProps({
  type: { type: String, default: 'text' }, // text,password,number,date,time
  name: String,
  id: String,
  modelValue: [ String, Number ],
  placeholder: {
    type: String,
    default: 'Please input keyword.',
  },
  maxlength: Number,
  required: Boolean,
  disabled: Boolean,
  readonly: Boolean,
  step: Number,
  min: Number,
  max: Number,
  size: String, // small
  color: String, // error
  pattern: String,
  list: String,
})
const emits = defineEmits([ 'update:modelValue', 'position', 'submit', 'click'  ])

function focus()
{
  $root.value.focus()
}

function onChangePosition(e)
{
  if (!('selectionStart' in e.target)) return
  emits('position', {
    start: e.target.selectionStart,
    end: e.target.selectionEnd,
  })
  emits('click', e)
}

function onChangeText(e)
{
  let value = e.target.value
  switch (props.type)
  {
    case 'number':
      value = Number(value)
      break
  }
  emits('update:modelValue', value)
}

defineExpose({ focus })
</script>

<style src="./input-text.scss" lang="scss" scoped></style>
