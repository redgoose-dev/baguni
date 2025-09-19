<template>
<LoadingScreen v-if="state.loading"/>
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
      @click="state.collection.open = true"/>
    <ButtonBasic
      v-if="!!$file?.src"
      title="다운로드"
      icon="download"
      theme="circle"
      size="big"
      @click="onClickDownload"/>
    <ButtonBasic
      v-if="$useCopyClipboard"
      title="이미지 복사하기"
      :icon="state.processingCopyClipboard ? 'loader' : 'copy'"
      :rotate-icon="state.processingCopyClipboard"
      theme="circle"
      size="big"
      :disabled="state.processingCopyClipboard"
      @click="onClickCopyClipboard"/>
    <ButtonBasic
      title="공유하기"
      icon="share-2"
      size="big"
      theme="circle"
      @click="state.openShare = true"/>
    <ButtonBasic
      title="수정"
      icon="edit"
      size="big"
      theme="circle"
      @click="editAsset(route.params.id)"/>
    <ButtonBasic
      title="삭제"
      icon="trash-2"
      size="big"
      theme="circle"
      color="danger"
      @click="removeAsset(route.params.id)"/>
  </nav>
  <div class="asset-body">
    <div class="asset-body__wrap">
      <aside class="asset-body__side">
        <ShadowBox class="wrap">
          <template v-if="$fileMeta">
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
          </template>
          <p v-else class="no-file">파일이 없습니다.</p>
        </ShadowBox>
      </aside>
      <div class="asset-body__content">
        <h1 class="title">
          <template v-if="data.title">{{data.title}}</template>
          <em v-else>Unknown title</em>
        </h1>
        <div
          ref="$content"
          v-if="$contentBody"
          v-html="$contentBody"
          class="content-body"/>
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
  </div>
</article>
<teleport to="#modal">
  <Modal
    :open="state.collection.open"
    :hide-scroll="true"
    :use-shortcut="true"
    animation="bottom-up"
    @close="state.collection.open = false">
    <SelectCollection
      :asset-id="Number(route.params.id)"
      :selected-collections="data?.collections || []"
      @submit="onSubmitSelectCollection"
      @close="state.collection.open = false"/>
  </Modal>
  <Modal
    :open="state.openShare"
    :hide-scroll="true"
    :use-shortcut="true"
    animation="bottom-up"
    @close="state.openShare = false">
    <ManageShare
      :asset-id="data.id"
      @close="state.openShare = false"/>
  </Modal>
  <Lightbox
    :src="state.lightboxImage"
    :use-shortcut="true"
    @close="state.lightboxImage = ''"/>
</teleport>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { authStore } from '../../store/index.js'
import { request } from '../../libs/api.js'
import { getByte } from '../../libs/strings.js'
import { getFileIcon } from '../../libs/files.js'
import { copyClipboardFile } from '../../libs/util.js'
import { toast } from '../../modules/toast/index.js'
import { parseMarkdown } from '../../modules/markdown.js'
import AppError from '../../modules/AppError.js'
import Tag from '../../components/form/tag.vue'
import ButtonBasic from '../../components/buttons/button-basic.vue'
import Icon from '../../components/icons/index.vue'
import ShadowBox from '../../components/content/shadow-box.vue'
import Modal from '../../components/modal/index.vue'
import ManageShare from './components/manage-share.vue'
import SelectCollection from '../collection/select-collection/index.vue'
import LoadingScreen from '../../components/asset/loading/screen.vue'
import Lightbox from '../../components/content/lightbox/index.vue'

const $content = ref()
const router = useRouter()
const route = useRoute()
const auth = authStore()
const state = reactive({
  loading: true,
  openShare: false,
  lightboxImage: '',
  processingCopyClipboard: false,
  collection: {
    open: false,
    id: undefined,
  },
})
const data = ref(null)

const $file = computed(() => {
  if (!data.value?.files?.main) return null
  const { id, name, type } = data.value.files.main
  let icon = getFileIcon(type)
  return {
    src: `/file/${id}/?_a=${auth.token}`,
    type: type.split('/')[0],
    name,
    icon,
  }
})
const $fileMeta = computed(() => {
  if (!data.value.files?.main) return null
  const { id, name, type, size, meta, created_at } = data.value.files.main
  return {
    id,
    name,
    type,
    size: getByte(size),
    ...(meta.width && meta.height ? {
      width: meta.width,
      height: meta.height,
    } : {}),
    date: created_at,
  }
})
const $inCollection = computed(() => (data.value?.collections?.length > 0))
const $useCopyClipboard = computed(() => {
  if (!$file.value?.src) return false
  return [ 'image', 'text' ].includes($file.value?.type)
})
const $contentBody = computed(() => parseMarkdown(data.value.description, true))

onMounted(async () => {
  const { id } = route.params
  if (!id) throw new AppError('에셋 아이디가 없습니다.', 204)
  const res = await request(`/asset/${id}/`)
  if (!res?.data) throw new AppError('에셋 데이터가 없습니다.', 204)
  data.value = res.data
  state.loading = false
  await nextTick()
  initEventsFromContent()
})

function onSubmitSelectCollection(ids)
{
  data.value.collections = ids
  state.collection.open = false
}

function onClickFile()
{
  const { type, src } = $file.value
  if (type !== 'image') return
  state.lightboxImage = src
}

function onClickDownload()
{
  if (!confirm('에셋 파일을 다운로드 합니다. 계속할까요?')) return
  location.href = `/file/${$fileMeta.value.id}/download/?_a=${auth.token}`
}

async function onClickCopyClipboard()
{
  try
  {
    state.processingCopyClipboard = true
    await copyClipboardFile($file.value.src, $fileMeta.value)
    toast.add('파일을 클립보드에 복사했습니다.', 'success').then()
    state.processingCopyClipboard = false
  }
  catch (e)
  {
    toast.add('클립보드에 복사할 수 없습니다.', 'error').then()
    state.processingCopyClipboard = false
  }
}

function editAsset(id)
{
  router.push(`/asset/${id}/edit/`).then()
}

async function removeAsset(id)
{
  if (!confirm('에셋을 삭제할까요? 삭제하면 다시 복구할 수 없습니다.')) return
  await request(`/asset/${id}/`, { method: 'delete' })
  toast.add('에셋을 삭제했습니다.', 'success').then()
  await router.replace('/')
}

function initEventsFromContent()
{
  if (!$content.value) return
  const $img = $content.value?.querySelectorAll('img')
  if (!($img?.length > 0)) return
  $img.forEach(el => {
    el.addEventListener('click', e => {
      state.lightboxImage = e.currentTarget.src
    })
  })
}
</script>

<style src="./detail.scss" lang="scss" scoped></style>
