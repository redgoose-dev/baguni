<template>
<fieldset class="manage-file-upload">
  <legend>에셋 파일</legend>
  <div
    v-if="$uploaded"
    ref="$uploadedFile"
    class="uploaded-file">
    <ShadowBox class="uploaded-file__box">
      <figure class="uploaded-file__preview">
        <button
          type="button"
          :title="meta.name"
          :disabled="$preview?.type !== 'image'"
          class="preview"
          @click="openFile">
          <img
            v-if="$preview?.type === 'image'"
            :src="$preview.src"
            alt="preview image">
          <i v-else>
            <Icon :name="$preview.icon"/>
          </i>
        </button>
        <Dropdown
          ref="$manage"
          :use-value="true"
          position="right"
          class="dropdown">
          <template #trigger>
            <Button type="button" icon="ellipsis" theme="circle" color="weak"/>
          </template>
          <Context
            :items="[
              { key: 'upload', label: '다시 업로드', icon: 'upload' },
              { key: 'remove', label: '삭제', icon: 'trash-2', color: 'danger' },
            ]"
            @select="onSelectAssetFileMenu"/>
        </Dropdown>
      </figure>
      <fieldset class="uploaded-file__body">
        <legend class="hidden">파일정보와 파일이름 변경 폼</legend>
        <div class="filename">
          <p>{{meta.name}}</p>
        </div>
        <div class="info">
          <dl v-if="$meta.type">
            <dt>타입</dt>
            <dd>{{$meta.type}}</dd>
          </dl>
          <dl v-if="$meta.size">
            <dt>사이즈</dt>
            <dd>{{$meta.size}}</dd>
          </dl>
          <dl v-if="$meta.imageSize">
            <dt>이미지 크기</dt>
            <dd>{{$meta.imageSize}}</dd>
          </dl>
          <dl v-if="$meta.date">
            <dt>날짜</dt>
            <dd>{{$meta.date}}</dd>
          </dl>
        </div>
      </fieldset>
    </ShadowBox>
  </div>
  <div
    v-else
    ref="$uploadFile"
    class="upload-file">
    <ShadowBox class="upload-file__box">
      <figure class="upload-file__body">
        <img src="../../../assets/images/img-upload-file.svg" alt="upload file"/>
        <figcaption>
          <h4>드래그앤 드롭을 하거나 버튼을 누르세요.</h4>
          <p>최대 20MB 사이즈의 파일까지 업로드할 수 있습니다.</p>
        </figcaption>
      </figure>
      <nav class="upload-file__button">
        <Button
          ref="$uploadButton"
          type="button"
          color="key-1"
          left-icon="upload"
          @click="onClickUploadFile">
          찾아보기..
        </Button>
      </nav>
    </ShadowBox>
  </div>
</fieldset>
</template>

<script setup>
import { ref, computed, watch, reactive, onMounted } from 'vue'
import { authStore } from '../../../store/auth.js'
import { fileUploader, getImageSize, getFileIcon } from '../../../libs/files.js'
import { getByte } from '../../../libs/strings.js'
import { dateFormat } from '../../../libs/dates.js'
import { apiPath } from '../../../libs/api.js'
import { toast } from '../../../modules/toast/index.js'
import Button from '../../../components/buttons/button-basic.vue'
import ShadowBox from '../../../components/content/shadow-box.vue'
import Dropdown from '../../../components/navigation/dropdown.vue'
import Context from '../../../components/navigation/context.vue'
import Icon from '../../../components/icons/index.vue'

const auth = authStore()
const $uploadFile = ref()
const $uploadButton = ref()
const $uploadedFile = ref()
const $manage = ref()
const props = defineProps({
  file: null,
  meta: Object,
})
const emits = defineEmits([ 'change-file', 'open-image' ])
const meta = reactive({
  filename: '',
  type: '',
  size: 0,
  imageSize: '',
  date: '',
})

const $uploaded = computed(() => {
  return (!!props.file?.name || !!props.meta?.name)
})
const $preview = computed(() => {
  if (typeof props.file === 'number')
  {
    return {
      type: $meta.value.type?.split('/')?.[0],
      src: `${apiPath}/file/${props.file}/`,
      icon: getFileIcon($meta.value.type),
    }
  }
  else if (props.file instanceof File)
  {
    return {
      type: $meta.value.type?.split('/')?.[0],
      src: URL.createObjectURL(props.file),
      icon: getFileIcon($meta.value.type),
    }
  }
  else
  {
    return null
  }
})
const $meta = computed(() => {
  let result = {
    name: meta.name,
    size: getByte(meta.size),
    type: meta.type,
  }
  if (meta.date) result.date = dateFormat(meta.date, '{yyyy}-{MM}-{dd} {hh}:{mm}:{ss}')
  if (meta.image) result.imageSize = `${meta.image.width}px * ${meta.image.height}px`
  return result
})

watch(() => props.file, async (value, _) => {
  await setMeta('file', value)
})
onMounted(async () => {
  if (props.meta)
  {
    await setMeta('meta', {
      ...props.meta,
      file: props.file,
    })
  }
})
defineExpose({
  focus,
})

/**
 * 파일 데이터를 메타 객체로 이전한다.
 */
async function setMeta(type, value)
{
  if (value)
  {
    meta.name = value.name
    meta.size = value.size
    meta.type = value.type
    switch (type)
    {
      case 'file':
        meta.date = value.lastModifiedDate
        if (/^image/.test(value.type))
        {
          meta.image = await getImageSize(value)
        }
        break
      case 'meta':
        meta.date = value.date
        if (/^image/.test(props.meta.type))
        {
          meta.image = await getImageSize(`${apiPath}/file/${props.file}/`)
        }
        break
    }
  }
  else
  {
    meta.name = null
    meta.date = null
    meta.size = 0
    meta.type = null
    meta.image = null
  }
}

async function onClickUploadFile()
{
  const { json } = auth.user
  const limitSize = json.asset.file_mainLimitSize
  const file = await fileUploader({
    accept: 'image',
  })
  if (!file) return
  if (json.asset.file_mainLimitSize < file.size)
  {
    toast.add(`파일 용량은 ${getByte(limitSize)}이상 업로드할 수 없습니다.`, 'error').then()
    return
  }
  emits('change-file', file)
}

function onSelectAssetFileMenu({ key })
{
  switch (key)
  {
    case 'upload':
      onClickUploadFile()
      break
    case 'remove':
      removeFile()
      break
  }
  $manage.value.close()
}

function openFile()
{
  if (!$preview.value?.src) return
  emits('open-image', $preview.value?.src)
}
function removeFile()
{
  emits('change-file', undefined)
}

function focus()
{
  if ($uploadButton.value) $uploadButton.value.focus()
}
</script>

<style src="./upload-file.scss" lang="scss" scoped></style>
