<template>
<div
  :class="[
    'item',
    $selected && 'selected',
  ]"
  @click.stop>
  <button
    type="button"
    class="item__button"
    @click.prevent="onClickItem">
    <img
      v-if="$isImage"
      :src="$fileSrc"
      alt="image item"
      draggable="false"/>
    <i v-else>
      <Icon :name="$fileIcon"/>
      <span>{{props.name}}</span>
    </i>
  </button>
  <nav class="item__nav">
    <ButtonBasic
      type="text"
      theme="circle"
      icon="ellipsis"/>
    <div class="context-body">
      <Context
        :items="[
          { key: 'new-window', label: '새창으로 열기', icon: 'external-link' },
          { key: 'insert-markdown', label: '마크다운 삽입', icon: 'list-plus' },
          { key: 'delete', label: '삭제', color: 'danger', icon: 'trash-2' },
        ]"
        @select="onSelectContext"/>
    </div>
  </nav>
</div>
</template>

<script setup>
import { computed } from 'vue'
import { authStore } from '../../../store/index.js'
import ButtonBasic from '../../buttons/button-basic.vue'
import Context from '../../navigation/context.vue'
import Icon from '../../icons/index.vue'

const auth = authStore()
const props = defineProps({
  id: Number,
  name: String,
  type: String,
  size: Number,
  meta: Object,
  selected: Array,
})
const emits = defineEmits([ 'select', 'action' ])

const $isImage = computed(() => {
  return /^image/.test(props.type)
})
const $fileSrc = computed(() => {
  return `/file/${props.id}/?_a=${auth.token}`
})
const $fileIcon = computed(() => {
  const arr = props.type.split('/')
  switch (arr[0])
  {
    case 'image':
      return null
    case 'text':
      return 'file-text'
    default:
      return 'file'
  }
})
const $selected = computed(() => {
  return props.selected.includes(props.id)
})

function onClickItem()
{
  emits('select', props.id)
}

function onSelectContext(e)
{
  emits('action', e.key, props.id)
}
</script>

<style src="./item.scss" lang="scss" scoped></style>
