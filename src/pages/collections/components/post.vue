<template>
<form class="post" @submit.prevent="onSubmit">
  <fieldset>
    <legend>컬렉션의 정보 입력</legend>
    <div class="field">
      <p><label for="title">제목</label></p>
      <div>
        <InputText
          id="title"
          name="title"
          v-model="forms.title"
          placeholder="컬렉션의 제목"
          :required="true"
          :maxlength="50"/>
      </div>
    </div>
    <div class="field">
      <p><label for="description">컬렉션의 설명</label></p>
      <div>
        <Textarea
          id="description"
          name="description"
          v-model="forms.description"
          placeholder="컬렉션의 설명을 입력해주세요."
          :rows="4"/>
      </div>
    </div>
  </fieldset>
  <fieldset>
    <legend>컬렉션의 커버 이미지 만들기</legend>
    <div class="field">
      <p><label for="">커버 이미지</label></p>
      <div class="cover">
        <div class="cover__image">
          <button
            type="button"
            :disabled="!$previewSrc"
            @click="onClickPreviewImage">
            <img
              v-if="$previewSrc"
              :src="$previewSrc"
              alt="preview image">
            <i v-else>
              <Icon name="image"/>
            </i>
          </button>
        </div>
        <nav class="cover__body">
          <p>- 사이즈: {{createSize.width}}px * {{createSize.height}}px</p>
          <div class="control">
            <ButtonGroup size="small">
              <ButtonBasic
                size="small"
                left-icon="upload"
                color="key-1"
                @click="uploadCoverImage">
                업로드
              </ButtonBasic>
              <ButtonBasic
                v-if="$uploadedCoverImage"
                size="small"
                left-icon="edit"
                @click="currentCropper.open = true">
                편집
              </ButtonBasic>
              <ButtonBasic
                v-if="!!currentCropper.file"
                size="small"
                left-icon="trash-2"
                color="danger"
                @click="deleteCoverImage">
                삭제
              </ButtonBasic>
            </ButtonGroup>
          </div>
        </nav>
      </div>
    </div>
  </fieldset>
  <nav class="post__submit">
    <ButtonBasic
      type="submit"
      color="key-1"
      size="big"
      :left-icon="processing ? 'loader' : 'check'"
      :rotate-icon="processing">
      {{$submitLabel}}
    </ButtonBasic>
  </nav>
  <teleport to="#modal">
    <Modal
      :open="currentCropper.open"
      :hide-scroll="true"
      @close="currentCropper.open = false">
      <ImageCropper
        :src="$createImageSrc"
        title="커버 이미지"
        submit-label="커버 이미지 만들기"
        :crop-size="[ createSize.width, createSize.height ]"
        :default-coordinates="currentCropper.coordinates"
        @submit="createCoverImage"
        @close="currentCropper.open = false"/>
    </Modal>
    <Lightbox
      :src="lightboxImage"
      @close="lightboxImage = ''"/>
  </teleport>
</form>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { authStore } from '../../../store/auth.js'
import { fileUploader } from '../../../libs/files.js'
import { apiPath } from '../../../libs/api.js'
import InputText from '../../../components/form/input-text.vue'
import Textarea from '../../../components/form/textarea.vue'
import Icon from '../../../components/icons/index.vue'
import ButtonGroup from '../../../components/buttons/group.vue'
import ButtonBasic from '../../../components/buttons/button-basic.vue'
import Modal from '../../../components/modal/index.vue'
import ImageCropper from '../../../components/content/image-cropper/index.vue'
import Lightbox from '../../../components/content/lightbox/index.vue'

const auth = authStore()
const props = defineProps({
  data: Object,
  processing: Boolean,
})
const emits = defineEmits([ 'close', 'submit' ])
const createSize = auth.user?.json?.collection?.file_coverCreateSize || { width: 640, height: 480 }
const forms = reactive({
  title: props.data?.title || '',
  description: props.data?.description || '',
})
const processing = ref(false)
const lightboxImage = ref('')
const readyOriginalImage = ref(null)
const currentCropper = reactive({
  open: false,
  file: props.data?.cover_create || undefined,
  coordinates: null,
  removedCover: !Boolean(props.data?.cover_create),
})

const $isEdit = computed(() => (!!props.data))
const $submitLabel = computed(() => {
  if (props.processing) return '처리중'
  return $isEdit.value ? '수정하기' : '만들기'
})
const $createImageSrc = computed(() => {
  if (readyOriginalImage.value) return URL.createObjectURL(readyOriginalImage.value)
  if (currentCropper.file instanceof File)
  {
    return URL.createObjectURL(currentCropper.file)
  }
  else if (currentCropper.file && typeof currentCropper.file === 'number')
  {
    return `${apiPath}/file/${currentCropper.file}/`
  }
  else
  {
    return null
  }
})
const $previewSrc = computed(() => {
  if (currentCropper.file instanceof File)
  {
    return URL.createObjectURL(currentCropper.file)
  }
  else if (currentCropper.file && typeof currentCropper.file === 'number')
  {
    return `${apiPath}/file/${currentCropper.file}/`
  }
  else
  {
    return null
  }
})
const $uploadedCoverImage = computed(() => {
  return currentCropper.file && currentCropper.file instanceof File
})

async function uploadCoverImage()
{
  const file = await fileUploader({ accept: 'image/*' })
  if (!file) return
  readyOriginalImage.value = file
  currentCropper.coordinates = null
  currentCropper.open = true
}

function createCoverImage({ coordinates, file })
{
  currentCropper.file = file
  currentCropper.coordinates = coordinates
  currentCropper.removedCover = false
  currentCropper.open = false
}

function onClickPreviewImage()
{
  lightboxImage.value = $previewSrc.value
}

function deleteCoverImage()
{
  currentCropper.file = null
  currentCropper.coordinates = null
  currentCropper.removedCover = true
  readyOriginalImage.value = null
}

async function onSubmit()
{
  if (!forms.title) return
  let body = {
    title: forms.title,
    description: forms.description || '',
  }
  if (currentCropper.file instanceof File)
  {
    body.cover_create = currentCropper.file
  }
  body.remove_files = [
    currentCropper.removedCover && 'cover-create',
  ].filter(Boolean).join(',')
  emits('submit', body)
}
</script>

<style src="./post.scss" lang="scss" scoped></style>
