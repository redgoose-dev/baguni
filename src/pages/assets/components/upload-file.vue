<template>
<fieldset class="manage-file-upload">
  <legend>에셋 파일</legend>
  <div
    v-if="uploaded"
    ref="$uploadedFile"
    class="uploaded-file">
    <ShadowBox class="uploaded-file__box">
      <figure class="uploaded-file__image">
        <button
          type="button"
          :title="meta.name"
          class="image"
          @click="openFile">
          <img
            v-if="_preview.type === 'image'"
            :src="_preview.src"
            alt="preview image">
        </button>
        <nav>
          <Button
            type="button"
            icon="trash-2"
            theme="circle"
            color="danger"
            @click="removeFile"/>
        </nav>
      </figure>
      <fieldset class="uploaded-file__body">
        <legend class="hidden">파일정보와 파일이름 변경 폼</legend>
        <div class="filename">
          <label for="filename">파일이름</label>
          <InputText
            v-model="meta.filename"
            name="filename"
            id="filename"
            placeholder="filename.jpg"
            size="small"/>
        </div>
        <div class="info">
          <dl v-if="meta.type">
            <dt>타입</dt>
            <dd>{{meta.type}}</dd>
          </dl>
          <dl v-if="meta.size">
            <dt>사이즈</dt>
            <dd>{{getByte(meta.size)}}</dd>
          </dl>
          <dl v-if="meta.imageSize">
            <dt>이미지 크기</dt>
            <dd>{{meta.imageSize}}</dd>
          </dl>
          <dl v-if="meta.date">
            <dt>날짜</dt>
            <dd>{{meta.date}}</dd>
          </dl>
        </div>
      </fieldset>
    </ShadowBox>
  </div>
  <div
    v-else
    ref="$uploadFile"
    :class="[
      'upload-file',
      false && 'dropzone',
    ]">
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
          type="button"
          color="key-1"
          @click="onClickUploadFile">
          찾아보기..
        </Button>
      </nav>
    </ShadowBox>
  </div>
  <pre class="pre-code">{{}}</pre>
</fieldset>
</template>

<script setup>
import { ref, computed, watch, reactive, onMounted } from 'vue'
import { fileUploader, getImageSize } from '../../../libs/files.js'
import { getByte } from '../../../libs/strings.js'
import { dateFormat } from '../../../libs/dates.js'
import Button from '../../../components/buttons/button-basic.vue'
import ShadowBox from '../../../components/content/shadow-box.vue'
import InputText from '../../../components/form/input-text.vue'

const $uploadFile = ref()
const $uploadedFile = ref()
const props = defineProps({
  file: null,
})
const emits = defineEmits([ 'update', 'open' ])
const meta = reactive({
  filename: '',
  type: '',
  size: '',
  imageSize: '',
  date: '',
})

const uploaded = computed(() => {
  return !!props.file
})
const _preview = computed(() => {
  if (!props.file) return null
  return {
    type: meta.type?.split('/')?.[0],
    src: URL.createObjectURL(props.file),
  }
})

watch(() => props.file, async (value, oldValue) => {
  await setMeta(value)
})
onMounted(async () => {
  if (props.file) await setMeta(props.file)
})

async function setMeta(value)
{
  if (value)
  {
    meta.filename = value.name
    meta.date = value.lastModifiedDate ? dateFormat(value.lastModifiedDate, '{yyyy}-{MM}-{dd} {hh}:{mm}:{ss}') : null
    meta.size = value.size
    meta.type = value.type
    meta.imageSize = await getImageSize(value)
    if (meta.imageSize) meta.imageSize = `${meta.imageSize.width}px * ${meta.imageSize.height}px`
  }
  else
  {
    meta.filename = null
    meta.date = null
    meta.size = null
    meta.type = null
    meta.imageSize = null
  }
}

async function onClickUploadFile()
{
  const file = await fileUploader({
    accept: 'image',
  })
  emits('update', file)
}

function openFile()
{
  emits('open', props.file)
}

function removeFile()
{
  emits('update', undefined)
}
</script>

<style src="./upload-file.scss" lang="scss" scoped></style>
