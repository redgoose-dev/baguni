<template>
<ButtonBasic
  :left-icon="props.icon"
  :href="props.href"
  :target="props.target"
  :title="props.title"
  :disabled="props.disabled"
  :size="props.size"
  :color="props.color"
  class="button-icon"/>
</template>

<script setup>
import ButtonBasic from './button-basic.vue'

const props = defineProps({
  icon: String,
  href: String,
  target: String,
  title: String,
  disabled: Boolean,
  size: String, // small,big
  color: String, // key-1,key-2,key-3,success,danger,dark,weak
})
</script>

<style lang="scss" scoped>
.button-icon {
  --button-padding: 0;
  aspect-ratio: 1 / 1;
  width: unset;
  --icon-size: 18px;
  --icon-stroke: 2.2;
  &:is(.button--small) {
    --icon-size: 14px;
    --icon-stroke: 2.5;
  }
  &:is(.button--big) {
    --icon-size: 24px;
    --icon-stroke: 1.6;
  }
}
</style>
