<template>
<div :class="[
  'tag',
  props.color && `tag--${props.color}`,
  props.useClick && 'tag--use-click',
  props.useRemove && 'tag--use-remove',
]">
  <component
    :is="useClick ? 'button' : 'span'"
    class="tag-body"
    @click="onClickBody">
    {{props.label}}
  </component>
  <button
    v-if="props.useRemove"
    type="button"
    class="tag-remove"
    @click="onClickRemove">
    <IconFeather name="x"/>
  </button>
</div>
</template>

<script setup>
import IconFeather from '../icons/feather.vue'

const props = defineProps({
  label: String,
  useClick: Boolean,
  useRemove: Boolean,
  color: String, // key-1,key-2,key-3,success,danger,weak
})
const emits = defineEmits([ 'click', 'remove' ])

function onClickBody()
{
  emits('click')
}

function onClickRemove()
{
  emits('remove')
}
</script>

<style src="./tag.scss" lang="scss" scoped></style>
