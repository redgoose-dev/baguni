<template>
<span class="button-body">
  <IconFeather
    v-if="!!props.leftIcon"
    :name="props.leftIcon"
    :animation="rotateIcon ? 'rotate' : ''"
    class="button-body__icon"/>
  <em
    v-if="props.isLabel"
    class="button-body__label">
    <slot/>
  </em>
  <IconFeather
    v-if="!!props.rightIcon"
    :name="props.rightIcon"
    :animation="rotateIcon ? 'rotate' : ''"
    class="button-body__icon"/>
</span>
</template>

<script setup>
import IconFeather from '../icons/feather.vue'

const props = defineProps({
  isLabel: Boolean,
  leftIcon: String,
  rightIcon: String,
  rotateIcon: Boolean,
})
</script>

<style src="./body.scss" lang="scss" scoped></style>
