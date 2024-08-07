<template>
<fieldset class="manage-cover-image">
  <legend>커버 이미지</legend>
  <ShadowBox class="box">
    <div class="cover-image-body">
      <button
        type="button"
        title="Open image on overlay"
        :disabled="!$previewSrc"
        class="image"
        @click="onClickPreviewImage">
        <img v-if="$previewSrc" :src="$previewSrc" alt="preview image">
        <i v-else>
          <Icon name="image"/>
        </i>
      </button>
      <div class="body">
        <p>사이즈: {{createSize.width}}px * {{createSize.height}}px</p>
        <div class="nav">
          <ButtonGroup size="small">
            <ButtonBasic
              size="small"
              color="key-1"
              left-icon="upload"
              @click="fileUpload">
              업로드
            </ButtonBasic>
            <Dropdown v-if="$useSetting" :use-value="true" class="cover-setting">
              <template #trigger>
                <ButtonBasic size="small" icon="ellipsis">
                  설정
                </ButtonBasic>
              </template>
              <Context
                :items="[
                  $useGetMainFile && { key: 'get-main', label: '파일 가져오기', icon: 'file-input' },
                  props.image && { key: 'edit', label: '편집', icon: 'crop' },
                  props.image && { key: 'delete', label: '삭제하기', color: 'danger', icon: 'trash-2' },
                ].filter(Boolean)"
                @select="selectControlMenuItem"/>
            </Dropdown>
          </ButtonGroup>
        </div>
      </div>
    </div>
  </ShadowBox>
  <teleport to="#modal">
    <Modal
      :open="currentCropper.open"
      :hide-scroll="true"
      @close="cancelCreateCoverImage">
      <ImageCropper
        :src="$createImageSrc"
        title="커버 이미지 만들기"
        submit-label="커버 이미지 만들기"
        :crop-size="[ createSize.width, createSize.height ]"
        :default-coordinates="currentCropper.coordinates"
        @submit="createCoverImage"
        @close="cancelCreateCoverImage"/>
    </Modal>
  </teleport>
</fieldset>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { authStore } from '../../../store/auth.js'
import { fileUploader } from '../../../libs/files.js'
import { apiPath } from '../../../libs/api.js'
import { getImageBlob } from '../../../libs/files.js'
import AppError from '../../../modules/AppError.js'
import ShadowBox from '../../../components/content/shadow-box.vue'
import Icon from '../../../components/icons/index.vue'
import ButtonGroup from '../../../components/buttons/group.vue'
import ButtonBasic from '../../../components/buttons/button-basic.vue'
import Dropdown from '../../../components/navigation/dropdown.vue'
import Context from '../../../components/navigation/context.vue'
import Modal from '../../../components/modal/index.vue'
import ImageCropper from '../../../components/content/image-cropper/index.vue'

const auth = authStore()
const props = defineProps({
  image: null,
  preview: null,
  coordinates: null,
  mainFile: null,
  mainFileMeta: null,
})
const emits = defineEmits([ 'update', 'open-image', 'get-main-image' ])
const createSize = auth.user?.json?.asset?.file_coverCreateSize || { width: 640, height: 480 }
const readyOriginalImage = ref(null)
const currentCropper = reactive({
  open: false,
  coordinates: null,
})

const $createImageSrc = computed(() => {
  if (readyOriginalImage.value) return URL.createObjectURL(readyOriginalImage.value)
  if (props.image instanceof File)
  {
    return URL.createObjectURL(props.image)
  }
  else if (props.image && typeof props.image === 'number')
  {
    return `${apiPath}/file/${props.image}/`
  }
  else
  {
    return null
  }
})
const $previewSrc = computed(() => {
  if (props.preview instanceof File)
  {
    return URL.createObjectURL(props.preview)
  }
  else if (props.preview && typeof props.preview === 'number')
  {
    return `${apiPath}/file/${props.preview}/`
  }
  else
  {
    return null
  }
})
const $useGetMainFile = computed(() => {
  return /^image/.test(props.mainFile?.type || props.mainFileMeta.type)
})
const $useSetting = computed(() => {
  return $useGetMainFile.value || props.image
})

function selectControlMenuItem({ key })
{
  switch (key)
  {
    case 'get-main':
      getMainFile()
      break
    case 'edit':
      currentCropper.coordinates = props.coordinates
      currentCropper.open = true
      break
    case 'delete':
      deleteCoverImage()
      break
  }
}

async function fileUpload()
{
  const file = await fileUploader({ accept: 'image/*' })
  if (!file) return
  readyOriginalImage.value = file
  currentCropper.coordinates = null
  currentCropper.open = true
}

async function createCoverImage({ coordinates, file })
{
  emits('update', {
    coordinates,
    original: readyOriginalImage.value,
    create: file,
  })
  readyOriginalImage.value = null
  currentCropper.open = false
}

function deleteCoverImage()
{
  emits('update', {
    removedCover: true,
  })
  readyOriginalImage.value = null
}

function cancelCreateCoverImage()
{
  readyOriginalImage.value = null
  currentCropper.open = false
}

function onClickPreviewImage()
{
  if (!$previewSrc.value) return
  emits('open-image', $previewSrc.value)
}

async function getMainFile()
{
  let mainFile
  if (props.mainFile?.name)
  {
    mainFile = props.mainFile.slice(0)
  }
  else if (typeof props.mainFile === 'number')
  {
    mainFile = await getImageBlob(`${apiPath}/file/${props.mainFile}/`)
  }
  else
  {
    throw new AppError('이미지를 가져오지 못했습니다.')
  }
  const newFile = new File([mainFile], props.mainFile.name, {
    type: props.mainFile.type,
    lastModified: props.mainFile.lastModified,
  })
  if (!newFile) return
  readyOriginalImage.value = newFile
  currentCropper.coordinates = null
  currentCropper.open = true
}
</script>

<style src="./manage-cover-image.scss" lang="scss" scoped></style>
