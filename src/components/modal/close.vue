<template>
<button
  type="button"
  class="modal-close"
  @click="emits('click')">
  <Icon name="x"/>
</button>
</template>

<script setup>
import Icon from '../icons/index.vue'

const emits = defineEmits([ 'click' ])
</script>

<style lang="scss" scoped>
.modal-close {
  position: absolute;
  right: 10px;
  top: 10px;
  margin: 0;
  padding: 10px;
  background: none;
  border-radius: 4px;
  border: none;
  outline: 2px solid transparent;
  outline-offset: -2px;
  cursor: pointer;
  --icon-margin: -5px;
  --icon-size: 20px;
  --icon-stroke: 2.5;
  &:active {
    opacity: .5;
  }
  &:focus-visible {
    outline-color: var(--color-key-1);
  }
}
</style>
