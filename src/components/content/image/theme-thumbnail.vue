<template>
<div class="image-item">
  <figure class="image-item__image">
    <router-link :to="props.to">
      <img
        :src="props.image"
        :alt="props.title">
    </router-link>
    <nav v-if="props.nav?.length > 0">
      <Dropdown ref="$context" :use-value="true" position="right">
        <Context
          :items="props.nav"
          @select="onSelectContext"/>
      </Dropdown>
    </nav>
  </figure>
  <div class="image-item__body">
    <h3 v-if="props.title" class="title">
      {{props.title}}
    </h3>
    <p v-if="props.description" class="description">
      {{props.description}}
    </p>
    <p v-if="props.meta?.length > 0" class="meta">
      <span v-for="keyword in props.meta">{{keyword}}</span>
    </p>
  </div>
</div>
</template>

<script setup>
import { ref } from 'vue'
import Dropdown from '../../navigation/dropdown.vue'
import Context from '../../navigation/context.vue'

const $context = ref()
const props = defineProps({
  to: String,
  image: String,
  title: String,
  description: String,
  meta: Array,
  nav: Array,
})

function onSelectContext({ key })
{
  $context.value.close()
}
</script>

<style src="./theme-thumbnail.scss" lang="scss" scoped></style>
