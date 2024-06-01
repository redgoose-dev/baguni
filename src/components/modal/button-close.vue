<template>
<button
  type="button"
  title="닫기"
  @click="emits('click')">
  <Icon name="x"/>
</button>
</template>

<script setup>
import Icon from '../icons/index.vue'

const emits = defineEmits([ 'close' ])
</script>

<style lang="scss" scoped>
@use '../../assets/scss/mixins';
button {
  display: grid;
  place-content: center;
  margin: 0;
  padding: 0;
  width: 44px;
  height: 44px;
  background: none;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  --icon-size: 28px;
  --icon-stroke: 1.6;
  @include mixins.focus-content();
  transition: opacity 120ms ease-out;
  &:active {
    opacity: .5;
  }
}
</style>
