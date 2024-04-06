<template>
<div :class="[
  'image-item',
  props.theme && `image-item--${props.theme}`,
]">
  <figure class="image">
    <router-link :to="props.to">
      <Image :src="props.image" :alt="props.title"/>
    </router-link>
  </figure>
  <div class="body">
    <Body
      :to="props.to"
      :title="props.title"
      :description="props.description"
      :meta="props.meta"/>
    <slot name="body"/>
  </div>
  <slot name="after"/>
</div>
</template>

<script setup>
import Image from './parts/image.vue'
import Body from './parts/body.vue'

const props = defineProps({
  to: { type: String, default: '#' },
  image: String,
  title: String,
  description: String,
  meta: Array,
  theme: { type: String, default: 'list' }, // list,thumbnail
})
</script>

<style src="./index.scss" lang="scss" scoped></style>
