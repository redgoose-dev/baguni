<template>
<component :is="props.tag" class="shadow-box">
  <slot/>
</component>
</template>

<script setup>
const props = defineProps({
  tag: { type: String, default: 'div' },
})
</script>

<style lang="scss" scoped>
.shadow-box {
  width: var(--shadow-box-width, unset);
  height: var(--shadow-box-height, unset);
  box-shadow:
    0 0 0 .5px hsla(0 0% 0% / 15%),
    0 4px 12px hsla(0 0% 0% / 15%),
    0 4px 36px hsla(0 0% 0% / 10%);
  border-radius: var(--shadow-box-radius, 8px);
  padding: var(--shadow-box-padding, 30px);
  box-sizing: border-box;
}
</style>
