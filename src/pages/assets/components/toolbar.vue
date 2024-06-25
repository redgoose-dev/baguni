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
      @click="emits('open-attachment-files')">
      첨부파일
    </ButtonBasic>
  </div>
</nav>
</template>

<script setup>
import { reactive } from 'vue'
import ButtonGroup from '../../../components/buttons/group.vue'
import ButtonBasic from '../../../components/buttons/button-basic.vue'
import Dropdown from '../../../components/navigation/dropdown.vue'
import Context from '../../../components/navigation/context.vue'

const emits = defineEmits([ 'open-attachment-files', 'action' ])
</script>

<style src="./toolbar.scss" lang="scss" scoped></style>
