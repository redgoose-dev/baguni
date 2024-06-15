<template>
<div class="collection-item">
  <figure class="collection-item__cover">
    <router-link :to="`/collection/${props.id}/`">
      <img
        v-if="props.thumbnail"
        :src="props.thumbnail"
        :alt="props.title"/>
      <i v-else>
        <Icon name="image"/>
      </i>
    </router-link>
  </figure>
  <div class="collection-item__body">
    <h2 class="title">
      <router-link :to="`/collection/${props.id}/`">
        {{props.title}}
      </router-link>
    </h2>
    <p class="description">
      {{props.description}}
    </p>
    <p class="meta">
      <span>{{props.assetsCount}}개의 에셋</span>
      <span>{{props.regdate}}</span>
    </p>
  </div>
  <nav class="collection-item__side">
    <Dropdown
      ref="$dropdown"
      v-model="openDropdown"
      position="right"
      class="dropdown">
      <template #trigger>
        <Button
          size="small"
          right-icon="chevron-down"
          :color="openDropdown ? 'weak' : ''">
          옵션
        </Button>
      </template>
      <Context
        :items="[
          { key: 'edit', label: '수정', icon: 'edit' },
          { key: 'remove', label: '삭제', icon: 'trash-2', color: 'danger' },
        ]"
        @select="onSelectContext"/>
    </Dropdown>
  </nav>
</div>
</template>

<script setup>
import { ref } from 'vue'
import Dropdown from '../../navigation/dropdown.vue'
import Context from '../../navigation/context.vue'
import Button from '../../buttons/button-basic.vue'
import Icon from '../../icons/index.vue'

const props = defineProps({
  id: Number,
  title: String,
  description: String,
  assetsCount: Number,
  regdate: String,
  thumbnail: String,
})
const emits = defineEmits([ 'context' ])
const $dropdown = ref()
const openDropdown = ref(false)

function onSelectContext({ key })
{
  emits('context', key)
  $dropdown.value.close()
}
</script>

<style src="./index.scss" lang="scss" scoped></style>
