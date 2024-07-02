<template>
<LoadingScreen v-if="loading" class="loading"/>
<article v-else class="share-detail">
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
      v-if="!!$file?.src"
      title="다운로드"
      icon="download"
      theme="circle"
      size="big"
      @click="onClickDownload"/>
    <ButtonBasic
      v-if="$useCopyClipboard"
      title="이미지 복사하기"
      :icon="processingCopyClipboard ? 'loader' : 'copy'"
      :rotate-icon="processingCopyClipboard"
      theme="circle"
      size="big"
      :disabled="processingCopyClipboard"
      @click="onClickCopyClipboard"/>
    <ButtonBasic
      title="공유하기"
      icon="share-2"
      theme="circle"
      size="big"
      @click="onClickCopyAddress"/>
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
      </div>
    </div>
  </div>
</article>
<teleport to="#modal">
  <Lightbox
    :src="lightboxImage"
    :use-shortcut="true"
    @close="lightboxImage = ''"/>
</teleport>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { request, apiPath } from '../../libs/api.js'
import { getByte } from '../../libs/strings.js'
import { getFileIcon } from '../../libs/files.js'
import { toast } from '../../modules/toast/index.js'
import { copyClipboardFile, createMeta, markdownToText } from '../../libs/util.js'
import { parseMarkdown } from '../../modules/markdown.js'
import AppError from '../../modules/AppError.js'
import ButtonBasic from '../../components/buttons/button-basic.vue'
import Icon from '../../components/icons/index.vue'
import ShadowBox from '../../components/content/shadow-box.vue'
import LoadingScreen from '../../components/asset/loading/screen.vue'
import Lightbox from '../../components/content/lightbox/index.vue'

const { VITE_URL_PATH, VITE_APP_NAME } = import.meta.env
const $content = ref()
const router = useRouter()
const route = useRoute()
const loading = ref(true)
const processingCopyClipboard = ref(false)
const data = ref({})
const lightboxImage = ref('')
const url = ref(`${VITE_URL_PATH}/share/${route.params.code}/`)

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
  if (!data.value?.files?.main) return null
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
const $useCopyClipboard = computed(() => {
  if (!$file.value?.src) return false
  return [ 'image', 'text' ].includes($file.value?.type)
})
const $contentBody = computed(() => {
  if (!data.value?.description) return null
  return parseMarkdown(data.value.description)
})

onMounted(async () => {
  const { code } = route.params
  if (!code) throw new AppError('공유 코드가 없습니다.', 204)
  let res
  try
  {
    res = await request(`/share/${code}/`, {
      method: 'get',
    })
  }
  catch (e)
  {
    if (e.message.includes('401 Unauthorized'))
    {
      throw new AppError('권한이 없습니다.', 401)
    }
  }
  if (!res?.data) throw new AppError('공유 데이터가 없습니다.', 204)
  data.value = res.data
  loading.value = false
  await nextTick()
  initEventsFromContent()
  setupHead()
})

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
  try
  {
    processingCopyClipboard.value = true
    await copyClipboardFile($file.value.src, $fileMeta.value)
    toast.add('파일을 클립보드에 복사했습니다.', 'success').then()
    processingCopyClipboard.value = false
  }
  catch (e)
  {
    toast.add('클립보드에 복사할 수 없습니다.', 'error').then()
    processingCopyClipboard.value = false
  }
}

async function onClickCopyAddress()
{
  await navigator.clipboard.writeText(url.value)
  toast.add('공유 주소를 클립보드에 복사했습니다.', 'success').then()
}

function initEventsFromContent()
{
  if (!$content.value) return
  const $img = $content.value?.querySelectorAll('img')
  if (!($img?.length > 0)) return
  $img.forEach(el => {
    el.addEventListener('click', e => {
      lightboxImage.value = e.currentTarget.src
    })
  })
}

function setupHead()
{
  const title = data.value.title ? `${VITE_APP_NAME} / ${data.value.title}` : VITE_APP_NAME
  const description = data.value?.description ? markdownToText(data.value.description, false)?.substring(0, 50) : ''
  let image = null
  if (data.value.files?.coverCreate)
  {
    image = `${apiPath}/file/${data.value.files.coverCreate}/`
  }
  else if (data.value?.files?.main?.type && /^image/.test(data.value.files.main.type))
  {
    image = `${apiPath}/file/${data.value?.files?.main.id}/?width=480&height=320&quality=75&type=cover`
  }
  document.title = title
  let meta = [
    description && { name: 'description', content: description },
    { property: 'og:title', content: title },
    description && { property: 'og:description', content: description },
    { property: 'og:url', content: url.value },
    image && { property: 'og:image', content: image },
  ].filter(Boolean)
  meta.forEach((o) => {
    const prevElement = document.querySelector(`head > meta[${o.property ? 'property' : 'name' }="${o.property || o.name}"]`)
    if (prevElement) document.head.removeChild(prevElement)
    const element = createMeta(o)
    document.head.appendChild(element)
  })
}
</script>

<style src="./detail.scss" lang="scss" scoped></style>
