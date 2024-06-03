<template>
<fieldset class="manage-file-upload">
  <legend>에셋 파일</legend>
  <div
    v-if="$uploaded"
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
            v-if="$preview?.type === 'image'"
            :src="$preview.src"
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
            v-model="meta.name"
            name="filename"
            id="filename"
            placeholder="filename.jpg"
            size="small"
            @update:model-value="updateMeta"/>
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
const emits = defineEmits([ 'change-file', 'update-meta', 'open-image' ])
const meta = reactive({
  filename: '',
  type: '',
  size: 0,
  imageSize: '',
  date: '',
})

const $uploaded = computed(() => {
  return !!props.file?.name
})
const $preview = computed(() => {
  if (!props.file?.name) return null
  return {
    type: meta.type?.split('/')?.[0],
    src: URL.createObjectURL(props.file),
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
  await setMeta(value)
})
onMounted(async () => {
  if (props.file) await setMeta(props.file)
})

/**
 * 파일 데이터를 메타 객체로 이전한다.
 */
async function setMeta(value)
{
  if (value?.name)
  {
    // TODO: value 값이 File일수도 있고 번호일수도 있다. 번호라면 수정 데이터로 보고 번호를 file id로 사용하고 메타 데이터로 값으로 사용하는게 좋겠다.
    meta.name = value.name
    meta.date = value.lastModifiedDate
    meta.size = value.size
    meta.type = value.type
    meta.image = await getImageSize(value)
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
  const file = await fileUploader({
    accept: 'image',
  })
  emits('change-file', file)
}

function updateMeta()
{
  emits('update-meta', {
    name: meta.name,
  })
}

function openFile()
{
  if (!props.file) return
  emits('open-image', URL.createObjectURL(props.file))
}
function removeFile()
{
  emits('change-file', undefined)
}
</script>

<style src="./upload-file.scss" lang="scss" scoped></style>
