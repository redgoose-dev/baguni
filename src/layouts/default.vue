<template>
<div
  ref="_layout"
  :class="[
    'layout',
    dropFiles.open && 'dragging',
  ]"
  @dragstart="onDragStart"
  @dragover.prevent="onDragOver"
  @dragleave.prevent="onDragLeave"
  @dragend.prevent="onDragEnd"
  @drop.prevent="onDrop">
  <LayoutHeader/>
  <div v-if="!hideContent" class="container">
    <slot/>
  </div>
  <LayoutFooter/>
</div>
<transition name="overlay-fade">
  <DropFilesOverlay
    v-if="dropFiles.open"
    :processing="dropFiles.processing"
    processing-title="에셋 만드는 중.."
    :total="dropFiles.total"
    :current="dropFiles.current"/>
</transition>
</template>

<script setup>
import { ref, reactive, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { authStore } from '../store/auth.js'
import { request, formData, apiPath } from '../libs/api.js'
import { sleep } from '../libs/util.js'
import { toast } from '../modules/toast/index.js'
import LayoutHeader from '../components/layout/header.vue'
import LayoutFooter from '../components/layout/footer.vue'
import DropFilesOverlay from '../components/asset/drop-files/overlay.vue'

const router = useRouter()
const route = useRoute()
const auth = authStore()
const _layout = ref()
const dropFiles = reactive({
  open: false,
  processing: false,
  total: 0,
  current: 0,
  message: '',
})
const hideContent = ref(false)
const allowDrag = ref(true)

function onDragStart()
{
  allowDrag.value = false
}
/**
 * drag over event
 */
function onDragOver(e)
{
  if (!allowDrag.value) return
  if (dropFiles.open) return
  dropFiles.open = true
}
/**
 * drag leave event
 */
function onDragLeave(e)
{
  if (_layout.value !== e.target) return false
  dropFiles.open = false
}
function onDragEnd()
{
  allowDrag.value = true
}
/**
 * drop event
 */
async function onDrop(e)
{
  if (!allowDrag.value)
  {
    allowDrag.value = true
    return
  }
  allowDrag.value = true
  const files = e.dataTransfer.files
  if (files.length > 0)
  {
    await addAssets(files)
  }
  else
  {
    dropFiles.open = false
  }
}

async function addAssets(files)
{
  try
  {
    dropFiles.total = files.length
    dropFiles.current = 0
    dropFiles.processing = true
    for (let i = 0; i<files.length; i++)
    {
      await addAsset(files[i])
      dropFiles.current = i + 1
    }
    toast.add('에셋 등록을 완료했습니다.', 'success').then()
    if (route.name === 'assets')
    {
      await blink()
    }
    else
    {
      await router.push('/')
    }
  }
  catch (e)
  {
    toast.add('에셋 등록중에 문제가 발생했습니다.', 'error').then()
  }
  finally
  {
    dropFiles.message = ''
    dropFiles.processing = false
    dropFiles.open = false
  }
}
async function addAsset(file)
{
  if (auth.user?.json?.asset?.file_mainLimitSize < file.size)
  {
    toast.add(`파일 사이즈가 큽니다.`, 'error').then()
    return
  }
  dropFiles.message = `"${file.name}" 파일 업로드중..`
  await request('/asset/', {
    method: 'post',
    body: formData({
      title: file.name,
      file,
    }),
  })
}

async function blink()
{
  hideContent.value = true
  await nextTick()
  hideContent.value = false
}
</script>

<style src="./default.scss" lang="scss" scoped></style>
