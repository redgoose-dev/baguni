<template>
<nav class="toolbar">
  <div>
    <ButtonGroup size="small">
      <Dropdown :use-value="true">
        <template #trigger>
          <ButtonBasic
            size="small"
            right-icon="chevron-down">
            마크다운
          </ButtonBasic>
        </template>
        <Context
          :items="[
          { key: 'link', label: '링크' },
          { key: 'image', label: '이미지' },
        ]"
          @select=""/>
      </Dropdown>
    </ButtonGroup>
  </div>
  <div>
    <ButtonBasic
      size="small"
      color="key-1"
      @click="attachmentFiles.open = true">
      첨부파일
    </ButtonBasic>
  </div>
</nav>
<teleport to="#modal">
<Modal
  :open="attachmentFiles.open"
  :full="true"
  :hide-scroll="true"
  :use-shortcut="true"
  animation="fade"
  @close="attachmentFiles.open = false">
  <AttachmentFiles/>
</Modal>
</teleport>
</template>

<script setup>
import { reactive } from 'vue'
import ButtonGroup from '../../../components/buttons/group.vue'
import ButtonBasic from '../../../components/buttons/button-basic.vue'
import Dropdown from '../../../components/navigation/dropdown.vue'
import Context from '../../../components/navigation/context.vue'
import Modal from '../../../components/modal/index.vue'
import AttachmentFiles from '../../../components/content/attachment-files/index.vue'

const attachmentFiles = reactive({
  open: false,
})

const emits = defineEmits([ 'action' ])
</script>

<style src="./toolbar.scss" lang="scss" scoped></style>
