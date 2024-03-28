<template>
<label :class="[
  'select',
  props.size && `select--${props.size}`,
  props.color && `select--${props.color}`,
  placeholder && 'select--placeholder',
]">
  <select
    :name="props.name"
    :id="props.id"
    :value="props.modelValue"
    :required="props.required"
    :disabled="props.disabled"
    @input="onUpdate">
    <template v-if="props.options?.length > 0">
      <option v-if="props.placeholder" value="">
        {{props.placeholder}}
      </option>
      <option v-for="item in props.options" :value="item.value">
        {{item.label}}
      </option>
    </template>
    <slot/>
  </select>
  <i>
    <IconFeather name="code"/>
  </i>
</label>
</template>

<script setup>
import { computed } from 'vue'
import IconFeather from '../icons/feather.vue'

const props = defineProps({
  name: String,
  id: String,
  modelValue: {
    type: [ String, Number ],
    default: '',
  },
  valueType: String, // text,number
  options: Array,
  required: Boolean,
  disabled: Boolean,
  size: String, // small
  color: String, // error
  placeholder: {
    type: [ String, null ],
    default: 'please select item',
  },
})
const emits = defineEmits([ 'update:modelValue' ])
const placeholder = computed(() => (!props.modelValue && props.placeholder))

function onUpdate(e)
{
  let value
  switch (props.valueType)
  {
    case 'number':
      value = Number(e.target.value)
      break
    case 'text':
    default:
      value = String(e.target.value)
      break
  }
  emits('update:modelValue', value)
}
</script>

<style src="./select.scss" lang="scss" scoped></style>
