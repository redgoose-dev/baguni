<template>
<nav class="context">
  <ul class="context-items">
    <li v-for="item in props.items">
      <button
        type="button"
        :class="[
          'context-item',
          item.color && `context-item--${item.color}`,
          item.icon && 'context-item--is-icon',
        ]"
        @click="onClickItem(item)">
        <span>{{item.label}}</span>
        <Icon v-if="item.icon" :name="item.icon"/>
      </button>
    </li>
  </ul>
</nav>
</template>

<script setup>
import Icon from '../icons/index.vue'

const props = defineProps({
  items: { type: Array, required: true }, // { label, icon, color }
})
const emits = defineEmits([ 'select' ])

function onClickItem(item)
{
  emits('select', item)
}
</script>

<style src="./context.scss" lang="scss" scoped></style>
