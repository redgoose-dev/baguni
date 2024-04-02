<template>
<fieldset
  :disabled="props.disabled"
  class="radio-button">
  <legend v-if="props.legend">{{props.legend}}</legend>
  <label v-for="o in props.options">
    .label
  </label>
</fieldset>
</template>

<script setup>
const props = defineProps({
  legend: String,
  name: String,
  id: String,
  options: { type: Array, required: true },
  modelValue: [ String, Number, Boolean ],
  required: Boolean,
  disabled: Boolean,
  size: String, // small,big
})
const emits = defineEmits([ 'update:modelValue' ])
</script>

<style src="./radio-button.scss" lang="scss" scoped></style>
