<template>
<div
  role="button"
  aria-pressed="false"
  tabindex="0"
  :class="[
    'item',
    props.active && 'item--on',
  ]"
  @click="onClick"
  @keydown="onKeydown">
  <figure class="item__image">
    <img
      v-if="props.thumbnail"
      :src="props.thumbnail"
      draggable="false"
      alt="Collection cover image"/>
    <i v-else>
      <Icon name="image"/>
    </i>
    <span v-if="props.active">
      <Icon name="check"/>
    </span>
  </figure>
  <div class="item__body">
    <h3>{{props.title}}</h3>
    <p>{{props.description}}</p>
  </div>
</div>
</template>

<script setup>
import Icon from '../../../components/icons/index.vue'

const props = defineProps({
  id: Number,
  title: String,
  description: String,
  thumbnail: String,
  active: Boolean,
})
const emits = defineEmits([ 'check' ])

function onClick()
{
  emits('check', props.id)
}

function onKeydown(e)
{
  if (e.key === 'Enter' || e.key === ' ') onClick()
}
</script>

<style src="./item.scss" lang="scss" scoped></style>
