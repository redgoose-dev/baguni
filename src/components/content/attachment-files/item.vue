<template>
<div :class="[
  'item',
]">
  <button
    type="button"
    title="ssdgsdg.jpg"
    class="item__image"
    @click.prevent="onClickItem">
    <img
      src="https://goose.redgoose.me/data/upload/original/202107/rg-20210521-000014.jpg"
      alt=""
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
          { key: 'new-window', label: '새창으로 열기' },
          { key: 'insert-markdown', label: '마크다운 삽입' },
          { key: 'delete', label: '삭제', color: 'danger' },
        ]"/>
    </div>
  </nav>
</div>
</template>

<script setup>
import ButtonBasic from '../../buttons/button-basic.vue'
import Context from '../../navigation/context.vue'
import Icon from '../../icons/index.vue'

function onClickItem()
{}
</script>

<style src="./item.scss" lang="scss" scoped></style>
