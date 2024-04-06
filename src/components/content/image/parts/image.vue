<template>
<img
  v-if="props.src"
  :src="props.src"
  :alt="props.title"
  loading="lazy">
<i v-else>
  <IconFeather name="image"/>
</i>
</template>

<script setup>
import IconFeather from '../../../icons/feather.vue'

const props = defineProps({
  src: String,
  alt: String,
})
</script>

<style lang="scss" scoped>
@use '../../../../assets/scss/mixins';
img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
i {
  display: grid;
  place-content: center;
  width: 100%;
  height: 100%;
  background-color: mixins.mix-alpha(var(--color-weak), 25%);
  --icon-size: var(--empty-icon-size, 36px);
  --icon-stroke: var(--empty-icon-stroke, 1);
  --icon-color: var(--color-light);
}
</style>
