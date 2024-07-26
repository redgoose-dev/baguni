<template>
<article class="attachment-files">
  <header class="files-header">
    <h1>
      <Icon name="file-search"/>
      <span>파일 첨부하기</span>
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
  <div class="info-bar">
    <div>
      <ButtonGroup size="small">
        <ButtonBasic
          color="key-1"
          left-icon="upload"
          size="small"
          @click="onUploadFiles">
          파일 업로드
        </ButtonBasic>
        <ButtonBasic
          size="small"
          left-icon="square-check-big"
          :disabled="!($index.length > 0)"
          @click="onClickSelectAll">
          모두 선택하기
        </ButtonBasic>
        <ButtonBasic
          color="danger"
          size="small"
          left-icon="trash-2"
          :disabled="!($selectedCount > 0)"
          @click="removeFiles(selected)">
          삭제
        </ButtonBasic>
      </ButtonGroup>
    </div>
    <p class="upload-info">
      <span>업로드</span>
      <em>{{$index.length}}/{{props.limit}}</em>
    </p>
  </div>
  <div
    ref="_content"
    class="content"
    @click="selected = []"
    @dragstart="onDragStart"
    @dragover.prevent="onDragOver"
    @dragleave.prevent="onDragLeave"
    @dragend.prevent="onDragEnd"
    @drop.prevent="onDrop">
    <LoadingScreen v-if="data.loading" class="loading"/>
    <div v-else-if="$index.length > 0" class="file-items-container">
      <ul class="file-items">
        <li v-for="o in $index">
          <Item
            v-bind="o"
            :selected="selected"
            @select="onSelectItem"
            @action="onActionItem"/>
        </li>
      </ul>
    </div>
    <EmptyContent v-else message="첨부파일이 없습니다." class="empty"/>
  </div>
  <footer class="files-footer">
    <div class="files-footer__left"></div>
    <div class="files-footer__right">
      <ButtonGroup>
        <ButtonBasic
          color="key-1"
          left-icon="toy-brick"
          :disabled="!($selectedCount > 0)"
          @click="onClickInsertFiles('markdown')">
          마크다운 삽입
        </ButtonBasic>
        <ButtonBasic
          color="key-2"
          left-icon="code-xml"
          :disabled="!($selectedCount > 0)"
          @click="onClickInsertFiles('html')">
          HTML 삽입
        </ButtonBasic>
      </ButtonGroup>
    </div>
  </footer>
  <transition name="overlay-fade">
    <DropFilesOverlay
      v-if="dropOverlay"
      class="drop-overlay">
      <template #title>여기에 파일 드롭</template>
      <template #description>
        파일을 여기로 드래그 앤 드롭하여 업로드하세요.
      </template>
    </DropFilesOverlay>
  </transition>
</article>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { request, formData, apiPath } from '../../../libs/api.js'
import { fileUploader } from '../../../libs/files.js'
import { createMarkdownItems, createHtmlItems, arrayToTextForReturn } from '../../../libs/strings.js'
import { sleep } from '../../../libs/util.js'
import { assetContentBody } from '../../../libs/consts.js'
import { toast } from '../../../modules/toast/index.js'
import ButtonGroup from '../../buttons/group.vue'
import ButtonBasic from '../../buttons/button-basic.vue'
import LoadingScreen from '../../asset/loading/screen.vue'
import EmptyContent from '../../content/empty-content.vue'
import DropFilesOverlay from '../../asset/drop-files/overlay.vue'
import Icon from '../../../components/icons/index.vue'
import Item from './item.vue'

const _content = ref()
const props = defineProps({
  assetId: Number,
  limit: { type: Number, default: 30 },
})
const emits = defineEmits([ 'action', 'close' ])
const data = reactive({
  loading: true,
  index: {},
  total: 0,
})
const selected = ref([])
const allowDrag = ref(true)
const dropOverlay = ref(false)

const $index = computed(() => {
  if (data?.index && Object.keys(data.index)?.length > 0)
  {
    return Object.entries(data.index)
      .map(([_,value]) => {
        return { ...value }
      })
      .sort((a,b) => b.id < a.id ? 1 : -1)
  }
  else
  {
    return []
  }
})
const $selectedCount = computed(() => {
  return selected.value?.length || 0
})

onMounted(() => {
  fetch().then()
})
onUnmounted(() => {})

async function fetch()
{
  data.loading = true
  const res = await request(`/asset/${props.assetId}/file-body/`, {
    method: 'get',
  })
  data.index = res?.data?.index?.reduce((acc, cur) => {
    acc[cur.id] = cur
    return acc
  }, data.index)
  data.total = res?.data?.total
  data.loading = false
}

async function uploadFile(file)
{
  if (props.limit <= $index.value.length)
  {
    toast.add('더이상 업로드할 수 없습니다.', 'error').then()
    return
  }
  const res = await request(`/asset/${props.assetId}/file-body/`, {
    method: 'post',
    body: formData({
      file,
    }),
  })
  if (res?.data?.file?.id)
  {
    if (!data.index) data.index = {}
    data.index[res.data.file.id] = res.data.file
    toast.add('파일을 추가했습니다.', 'success').then()
  }
  else
  {
    toast.add('파일을 추가하지 못했습니다.', 'error').then()
  }
}
async function uploadFiles(files)
{
  for (let i=0; i<files.length; i++)
  {
    await uploadFile(files[i])
    await sleep(200)
  }
}

async function removeFiles(ids)
{
  async function remove(id)
  {
    try
    {
      await request(`/asset/${props.assetId}/file-body/${id}/`, {
        method: 'delete',
      })
      if (data?.index?.[id]) delete data.index[id]
      toast.add('파일을 삭제했습니다.', 'success').then()
    }
    catch (e)
    {
      toast.add('파일을 삭제하지 못했습니다.', 'error').then()
    }
  }
  for (let i=0; i<ids.length; i++)
  {
    await remove(ids[i])
    await sleep(200)
  }
}

async function onUploadFiles()
{
  const files = await fileUploader({
    multiple: true,
    accept: 'image/*',
  })
  await uploadFiles(files)
}

function onSelectItem(id)
{
  const idx = selected.value.indexOf(id)
  if (idx > -1)
  {
    selected.value.splice(idx, 1)
  }
  else
  {
    selected.value.push(id)
  }
}
function onActionItem(action, id)
{
  switch (action)
  {
    case 'new-window':
      window.open(`${apiPath}/file/${id}/`)
      break
    case 'insert-markdown':
      emits('action', 'insert', convertIdToCode([id], 'markdown'))
      emits('close')
      break
    case 'delete':
      removeFiles([id]).then()
      break
  }
}

function onClickSelectAll()
{
  if (selected.value.length > 0)
  {
    selected.value = []
  }
  else
  {
    selected.value = $index.value.map(o => (o.id))
  }
}

function convertIdToCode(ids, type)
{
  let code
  switch (type)
  {
    case 'markdown':
      code = createMarkdownItems(ids.map(id => {
        const item = data.index[id]
        return {
          name: item.name,
          path: `${assetContentBody.host}${apiPath}/file/${item.id}/`,
          type: item.type,
        }
      }))
      break
    case 'html':
      code = createHtmlItems(ids.map(id => {
        const item = data.index[id]
        return {
          name: item.name,
          path: `${assetContentBody.host}${apiPath}/file/${item.id}/`,
          type: item.type,
        }
      }))
      break
  }
  return arrayToTextForReturn(code)
}

function onClickInsertFiles(mode)
{
  switch (mode)
  {
    case 'markdown':
    case 'html':
      emits('action', 'insert', convertIdToCode(selected.value, mode))
      emits('close')
      break
  }
}

function onDragStart()
{
  allowDrag.value = false
}
function onDragOver(e)
{
  if (!allowDrag.value) return
  if (dropOverlay.value) return
  dropOverlay.value = true
}
function onDragLeave(e)
{
  if (_content.value !== e.target) return false
  dropOverlay.value = false
}
function onDragEnd()
{
  dropOverlay.value = true
}
async function onDrop(e)
{
  if (!dropOverlay.value)
  {
    dropOverlay.value = true
    return
  }
  dropOverlay.value = false
  const files = e.dataTransfer.files
  if (files.length > 0) await uploadFiles(files)
}
</script>

<style src="./index.scss" lang="scss" scoped></style>
