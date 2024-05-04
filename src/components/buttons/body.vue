<template>
<span class="button-body">
  <Icon
    v-if="!!props.leftIcon"
    :name="props.leftIcon"
    :animation="rotateIcon ? 'rotate' : ''"
    class="button-body__side"/>
  <Icon
    v-if="props.icon"
    :name="props.icon"
    :animation="rotateIcon ? 'rotate' : ''"
    class="button-body__icon"/>
  <em
    v-else-if="props.isLabel"
    class="button-body__label">
    <slot/>
  </em>
  <Icon
    v-if="!!props.rightIcon"
    :name="props.rightIcon"
    :animation="rotateIcon ? 'rotate' : ''"
    class="button-body__side"/>
</span>
</template>

<script setup>
import Icon from '../icons/index.vue'

const props = defineProps({
  isLabel: Boolean,
  icon: String,
  leftIcon: String,
  rightIcon: String,
  rotateIcon: Boolean,
})
</script>

<style src="./body.scss" lang="scss" scoped></style>
