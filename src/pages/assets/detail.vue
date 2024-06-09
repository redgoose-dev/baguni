<template>
<LoadingScreen v-if="loading"/>
<article v-else class="asset">
  <figure class="asset-image">
    <button
      v-if="$file"
      type="button"
      :disabled="$file.type !== 'image'"
      class="trigger"
      @click="onClickFile">
      <img
        v-if="$file.type === 'image'"
        :src="$file.src"
        :alt="$file.name">
      <i v-else>
        <Icon :name="$file.icon"/>
        <em>{{$file.name}}</em>
      </i>
    </button>
    <div v-else class="empty">
      <Icon name="file-x"/>
    </div>
  </figure>
  <nav class="asset-nav">
    <ButtonBasic
      title="컬렉션"
      icon="bookmark"
      theme="circle"
      size="big"
      :color="$inCollection ? 'key-1' : ''"
      @click="collection.open = true"/>
    <ButtonBasic
      title="다운로드"
      icon="download"
      theme="circle"
      size="big"
      @click="onClickDownload"/>
    <ButtonBasic
      title="이미지 복사하기"
      :icon="processingCopyClipboard ? 'loader' : 'copy'"
      :rotate-icon="processingCopyClipboard"
      theme="circle"
      size="big"
      :disabled="!$useCopyClipboard || processingCopyClipboard"
      @click="onClickCopyClipboard"/>
    <Dropdown v-model="controlOption.open">
      <template #trigger>
        <ButtonBasic
          title="옵션"
          icon="more-horizontal"
          theme="circle"
          size="big"
          :color="controlOption.open ? 'blur' : ''"/>
      </template>
      <Context
        :items="controlOption.context"
        @select="onSelectAssetManage"/>
    </Dropdown>
  </nav>
  <div class="asset-body">
    <aside class="asset-body__side">
      <ShadowBox v-if="$fileMeta" class="wrap">
        <section>
          <h1>파일이름</h1>
          <p>{{$fileMeta.name}}</p>
        </section>
        <section>
          <h1>타입</h1>
          <p>{{$fileMeta.type}}</p>
        </section>
        <section>
          <h1>사이즈</h1>
          <p>{{$fileMeta.size}}</p>
        </section>
        <section v-if="$fileMeta.width && $fileMeta.height">
          <h1>이미지 크기</h1>
          <p>{{$fileMeta.width}}px * {{$fileMeta.height}}px</p>
        </section>
        <section>
          <h1>등록일</h1>
          <p>{{$fileMeta.date}}</p>
        </section>
      </ShadowBox>
    </aside>
    <div class="asset-body__content">
      <h1 class="title">
        <template v-if="data.title">{{data.title}}</template>
        <em v-else>Unknown title</em>
      </h1>
      <div v-if="data.description" v-html="data.description" class="content-body"/>
      <em v-else class="empty-content-body">
        Unknown description
      </em>
      <article v-if="data.tags?.length > 0" class="tags">
        <h1>태그</h1>
        <p>
          <Tag v-for="o in data.tags" :label="o"/>
        </p>
      </article>
    </div>
  </div>
</article>
<teleport to="#modal">
  <Modal
    :open="share.open"
    :hide-scroll="true"
    :use-shortcut="true"
    @close="share.open = false">
    <ManageShare
      :id="share.id"
      @close="share.open = false"/>
  </Modal>
  <Modal
    :open="collection.open"
    :hide-scroll="true"
    :use-shortcut="true"
    @close="collection.open = false">
    <SelectCollection
      :asset-id="Number(route.params.id)"
      :selected-collections="data?.collections"
      @close="collection.open = false"/>
  </Modal>
  <Lightbox
    :src="lightboxImage"
    :use-shortcut="true"
    @close="lightboxImage = ''"/>
</teleport>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import imageResize from 'image-resize'
import { request, apiPath } from '../../libs/api.js'
import { getByte } from '../../libs/strings.js'
import { getFileIcon } from '../../libs/files.js'
import { toast } from '../../modules/toast/index.js'
import AppError from '../../modules/AppError.js'
import Tag from '../../components/form/tag.vue'
import ButtonBasic from '../../components/buttons/button-basic.vue'
import Icon from '../../components/icons/index.vue'
import Dropdown from '../../components/navigation/dropdown.vue'
import Context from '../../components/navigation/context.vue'
import ShadowBox from '../../components/content/shadow-box.vue'
import Modal from '../../components/modal/index.vue'
import ManageShare from './components/manage-share.vue'
import SelectCollection from '../collections/select-collection/index.vue'
import LoadingScreen from '../../components/asset/loading/screen.vue'
import Lightbox from '../../components/content/lightbox/index.vue'

const router = useRouter()
const route = useRoute()
const loading = ref(true)
const data = ref({})
const controlOption = reactive({
  open: false,
  context: [
    { key: 'share', label: '공유하기', icon: 'share-2' },
    { key: 'edit', label: '수정', icon: 'edit' },
    { key: 'delete', label: '삭제', icon: 'trash-2', color: 'danger' },
  ],
})
const share = reactive({
  id: undefined,
  open: false,
})
const collection = reactive({
  id: undefined,
  open: false,
})
const lightboxImage = ref('')
const processingCopyClipboard = ref(false)

const $file = computed(() => {
  if (!data.value?.files?.main) return null
  const { id, name, type } = data.value.files.main
  let icon = getFileIcon(type)
  return {
    src: `${apiPath}/file/${id}/`,
    type: type.split('/')[0],
    name,
    icon,
  }
})
const $fileMeta = computed(() => {
  if (!data.value.files?.main) return null
  const { id, name, type, size, meta, date } = data.value.files.main
  return {
    id,
    name,
    type,
    size: getByte(size),
    ...(meta.width && meta.height ? {
      width: meta.width,
      height: meta.height,
    } : {}),
    date,
  }
})
const $inCollection = computed(() => (data.value?.collections?.length > 0))
const $useCopyClipboard = computed(() => {
  return [ 'image', 'text' ].includes($file.value.type)
})

onMounted(async () => {
  const { id } = route.params
  if (!id) throw new AppError('에셋 아이디가 없습니다.', 204)
  const res = await request(`/asset/${id}/`, {
    method: 'get',
  })
  if (!res?.data) throw new AppError('에셋 데이터가 없습니다.', 204)
  data.value = res.data
  loading.value = false
})

function onSelectAssetManage(item)
{
  const { id } = route.params
  switch (item.key)
  {
    case 'share':
      share.open = true
      break
    case 'edit':
      editAsset(id)
      break
    case 'delete':
      removeAsset(id).then()
      break
  }
  controlOption.open = false
}

function onClickFile()
{
  const { type, src } = $file.value
  if (type !== 'image') return
  lightboxImage.value = src
}

function onClickDownload()
{
  if (!confirm('에셋 파일을 다운로드 합니다. 계속할까요?')) return
  location.href = `${apiPath}/download/${$fileMeta.value.id}/`
}

async function onClickCopyClipboard()
{
  processingCopyClipboard.value = true
  let blob
  const res = await fetch($file.value.src)
  let type = $fileMeta.value.type
  if ([ 'image/webp', 'image/jpeg', 'image/gif' ].includes(type))
  {
    blob = await res.blob()
    blob = await imageResize(blob, {
      width: $fileMeta.value.width || 900,
      outputType: 'blob',
      format: 'png'
    })
    type = 'image/png'
  }
  else if (/^image/.test(type))
  {
    blob = await res.blob()
  }
  if (blob)
  {
    const data = [
      new ClipboardItem({ [type]: blob })
    ]
    await navigator.clipboard.write(data)
    toast.add('파일을 클립보드에 복사했습니다.', 'success').then()
  }
  else
  {
    toast.add('클립보드에 복사할 수 없습니다.', 'error').then()
  }
  processingCopyClipboard.value = false
}

function editAsset(id)
{
  router.push(`/asset/edit/${id}/`).then()
}

async function removeAsset(id)
{
  if (!confirm('에셋을 삭제할까요? 삭제하면 다시 복구할 수 없습니다.')) return
  await request(`${apiPath}/asset/${id}/`, { method: 'delete' })
  toast.add('에셋을 삭제했습니다.', 'success').then()
  await router.replace('/')
}
</script>

<style src="./detail.scss" lang="scss" scoped></style>
