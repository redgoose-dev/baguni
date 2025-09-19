<template>
<nav class="toolbar">
  <div>
    <ButtonGroup size="small">
      <Dropdown v-model="markdown.basic">
        <template #trigger>
          <ButtonBasic
            title="마크다운 기본"
            size="small"
            :right-icon="markdown.basic ? 'chevron-up' : 'chevron-down'"
            :color="markdown.basic ? 'weak' : ''">
            마크다운
          </ButtonBasic>
        </template>
        <Context
          :items="[
            { key: 'space', label: '공백', icon: 'space' },
            { key: 'link', label: '링크', icon: 'link-2' },
            { key: 'image', label: '이미지', icon: 'image' },
            { key: 'iframe', label: '아이프레임', icon: 'youtube' },
          ]"
          @select="onSelectMarkdownTools"/>
      </Dropdown>
      <Dropdown v-model="markdown.grid">
        <template #trigger>
          <ButtonBasic
            title="그리드"
            size="small"
            :right-icon="markdown.grid ? 'chevron-up' : 'chevron-down'"
            :color="markdown.grid ? 'weak' : 'weak'">
            그리드
          </ButtonBasic>
        </template>
        <Context
          :items="[
            { key: 'grid-group', label: '그리드 그룹', icon: 'component' },
            { key: 'grid-image', label: '그리드 이미지', icon: 'grid-2x2' },
          ]"
          @select="onSelectMarkdownTools"/>
      </Dropdown>
    </ButtonGroup>
  </div>
  <div>
    <ButtonBasic
      v-if="props.isEdit"
      size="small"
      color="key-1"
      left-icon="file-search"
      @click="emits('open-attachment-files')">
      첨부파일
    </ButtonBasic>
  </div>
</nav>
</template>

<script setup>
import { reactive } from 'vue'
import * as markdownCodes from '../../../libs/markdown.js'
import ButtonGroup from '../../../components/buttons/group.vue'
import ButtonBasic from '../../../components/buttons/button-basic.vue'
import Dropdown from '../../../components/navigation/dropdown.vue'
import Context from '../../../components/navigation/context.vue'

const props = defineProps({
  isEdit: Boolean,
})
const emits = defineEmits([ 'open-attachment-files', 'action' ])
const markdown = reactive({
  basic: false,
  grid: false,
})

function onSelectMarkdownTools({ key })
{
  let src
  switch (key)
  {
    case 'space':
      src = markdownCodes.space
      break
    case 'link':
      src = markdownCodes.link
      break
    case 'image':
      src = markdownCodes.image
      break
    case 'iframe':
      src = markdownCodes.iframe
      break
    case 'grid-group':
      src = markdownCodes.gridGroup
      break
    case 'grid-image':
      src = markdownCodes.gridItem
      break
  }
  if (src) emits('action', 'insert-description', src)
  markdown.basic = false
  markdown.grid = false
}
</script>

<style src="./toolbar.scss" lang="scss" scoped></style>
