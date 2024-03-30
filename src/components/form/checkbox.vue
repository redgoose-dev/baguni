<template>
<label :class="[
  'checkbox',
  props.size && `checkbox--${props.size}`,
]">
  <input
    type="checkbox"
    :name="props.name"
    :id="props.id"
    :checked="props.modelValue"
    :required="props.required"
    :disabled="props.disabled"
    @change="changeValue">
  <i>
    <IconFeather name="check" class="check"/>
  </i>
</label>
</template>

<script setup>
import IconFeather from '../icons/feather.vue'

const props = defineProps({
  name: String,
  id: String,
  modelValue: Boolean,
  required: Boolean,
  disabled: Boolean,
  size: String, // small
})
const emits = defineEmits([ 'update:modelValue' ])

function changeValue(e)
{
  emits('update:modelValue', Boolean(e.target.checked))
}
</script>

<style src="./checkbox.scss" lang="scss" scoped></style>
