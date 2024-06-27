<template>
<div :class="[
  'item',
  props.selected && 'selected',
]">
  <button
    type="button"
    class="item__image"
    @click.prevent="onClickItem">
    <img
      :src="$imgSrc"
      alt="image item"
      draggable="false"/>
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
import { apiPath } from '../../../libs/api.js'
import ButtonBasic from '../../buttons/button-basic.vue'
import Context from '../../navigation/context.vue'
import Icon from '../../icons/index.vue'

const props = defineProps({
  id: Number,
  selected: Boolean,
})

const $imgSrc = computed(() => {
  // return 'https://goose.redgoose.me/data/upload/original/202107/rg-20210521-000014.jpg'
  return `${apiPath}/file/${props.id}/`
})

function onClickItem()
{
  console.log('onClickItem()', props.id)
}

function onSelectContext(e)
{
  console.log('onSelectContext()', e)
}
</script>

<style src="./item.scss" lang="scss" scoped></style>
