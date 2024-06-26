<template>
<textarea
  ref="$root"
  :name="props.name"
  :id="props.id"
  :value="props.modelValue"
  :required="props.required"
  :disabled="props.disabled"
  :readonly="props.readonly"
  :rows="props.rows"
  :placeholder="props.placeholder"
  autocomplete="off"
  autocorrect="off"
  autocapitalize="off"
  spellcheck="false"
  :class="[
    'textarea',
    props.size && `textarea--${props.size}`,
    props.color && `textarea--${props.color}`,
  ]"
  @input="onChangeText"
  @click="onChangePosition"
  @keyup="onChangePosition"
  @keyup.ctrl.enter.stop="emits('submit')"
  @keydown.meta.enter.stop="emits('submit')"/>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const $root = ref()
const props = defineProps({
  name: String,
  id: String,
  modelValue: String,
  placeholder: {
    type: String,
    default: 'Please input keyword.',
  },
  maxlength: Number,
  required: Boolean,
  disabled: Boolean,
  readonly: Boolean,
  rows: { type: Number, default: 4, },
  size: String, // small
  color: String, // error
  autoSize: Boolean,
})
const emits = defineEmits([ 'update:modelValue', 'position', 'submit' ])

function onChangePosition(e)
{
  if (!('selectionStart' in e.target)) return
  emits('position', {
    start: e.target.selectionStart,
    end: e.target.selectionEnd
  })
}
function onChangeText(e)
{
  if (props.autoSize) changeHeight()
  emits('update:modelValue', e.target.value)
}

function changeHeight()
{
  const { style } = $root.value
  style.setProperty('--textarea-height', `auto`)
  style.setProperty('--textarea-height', `${$root.value.scrollHeight}px`)
}

function focus()
{
  $root.value.focus()
}

function changeCursor(start, end)
{
  $root.value.setSelectionRange(start, end)
}

onMounted(() => {
  if (props.autoSize) changeHeight()
})

defineExpose({
  changeHeight,
  changeCursor,
  focus,
})
</script>

<style src="./textarea.scss" lang="scss" scoped></style>
