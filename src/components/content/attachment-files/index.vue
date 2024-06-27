<template>
<article class="attachment-files">
  <header class="files-header">
    <h1>
      <Icon name="file-search"/>
      파일첨부
    </h1>
    <nav>
      <button
        type="button"
        title="닫기"
        @click="emits('close')">
        <Icon name="x"/>
      </button>
    </nav>
  </header>
  <div class="content">
    <div class="file-items-container">
      <p class="index-description">
        업로드한 파일은 총 <strong>12</strong>개입니다.
      </p>
      <ul class="file-items">
        <li v-for="o in [ 101, 104, 110, 111, 112, 115 ]">
          <Item
            :id="o"
            :selected="false"/>
        </li>
      </ul>
    </div>
  </div>
  <footer class="files-footer">
    <div class="files-footer__left"></div>
    <div class="files-footer__right">
      <ButtonGroup>
        <ButtonBasic
          color="key-1"
          @click="onClickInsertFiles">
          마크다운 삽입
        </ButtonBasic>
        <ButtonBasic
          color="key-2"
          @click="onClickInsertFiles">
          HTML 삽입
        </ButtonBasic>
      </ButtonGroup>
    </div>
  </footer>
</article>
</template>

<script setup>
import { reactive, onMounted, onUnmounted } from 'vue'
import { request } from '../../../libs/api.js'
import ButtonGroup from '../../buttons/group.vue'
import ButtonBasic from '../../buttons/button-basic.vue'
import Icon from '../../../components/icons/index.vue'
import Item from './item.vue'

const props = defineProps({
  assetId: Number,
})
const emits = defineEmits([ 'close' ])
const data = reactive({
  index: [],
})

onMounted(async () => {
  const ii = await request(`/asset/${props.assetId}/file-body/`, {
    method: 'get',
  })
  console.log(ii)
})

function onClickInsertFiles()
{
  console.log('onClickInsertFiles()')
}
</script>

<style src="./index.scss" lang="scss" scoped></style>
