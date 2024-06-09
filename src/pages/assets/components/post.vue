<template>
<form class="post" @submit.prevent="onSubmit">
  <aside class="post__side">
    <UploadFile
      ref="$uploadFile"
      :file="files.main"
      :meta="forms.file"
      class="upload"
      @change-file="onChangeMainFile"
      @open-image="onOpenImage"/>
    <ManageCoverImage
      :image="files.coverOriginal"
      :preview="files.coverCreate"
      :coordinates="forms.cover.coordinates"
      class="cover-image"
      @update="onUpdateCoverImage"
      @open-image="onOpenImage"/>
  </aside>
  <div class="post__body">
    <fieldset class="field">
      <legend class="hidden">제목 입력 폼</legend>
      <label for="title">제목</label>
      <div class="body">
        <InputText
          v-model="forms.title"
          name="title"
          id="title"
          placeholder="제목을 입력해주세요."/>
      </div>
    </fieldset>
    <fieldset class="field">
      <legend class="hidden">설명 입력 폼</legend>
      <label for="description">설명</label>
      <div class="body">
        <Textarea
          v-model="forms.description"
          name="description"
          id="description"
          placeholder="설명을 입력해주세요."/>
      </div>
    </fieldset>
    <ManageTags v-model="forms.tags"/>
    <nav class="submit">
      <Button
        type="submit"
        size="big"
        color="key-1"
        :disabled="props.processing"
        :rotate-icon="props.processing"
        :left-icon="props.processing ? 'loader' : 'check'">
        {{$submitLabel}}
      </Button>
    </nav>
  </div>
</form>
<teleport to="#modal">
  <Lightbox
    :src="lightboxImage"
    @close="lightboxImage = ''"/>
</teleport>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { pureObject } from '../../../libs/objects.js'
import Button from '../../../components/buttons/button-basic.vue'
import UploadFile from './upload-file.vue'
import ManageCoverImage from './manage-cover-image.vue'
import ManageTags from './manage-tags.vue'
import InputText from '../../../components/form/input-text.vue'
import Textarea from '../../../components/form/textarea.vue'
import Lightbox from '../../../components/content/lightbox/index.vue'

const $uploadFile = ref()
const props = defineProps({
  data: Object, // create,edit
  processing: Boolean,
})
const emits = defineEmits([ 'submit' ])
const forms = reactive({
  title: props.data?.title || '',
  description: props.data?.description || '',
  tags: pureObject(props.data?.tags) || [],
  file: props.data?.file ? {
    name: props.data.file.name,
    size: props.data.file.size,
    type: props.data.file.type,
    date: new Date(props.data.file.date),
  } : {},
  cover: {
    coordinates: pureObject(props.data?.json?.cover?.coordinates),
  },
})
const files = reactive({
  main: props.data?.file?.id || undefined,
  coverOriginal: props.data?.cover_original || undefined,
  coverCreate: props.data?.cover_create || undefined,
  removedMain: !Boolean(props.data?.file?.id),
  removedCover: !Boolean(props.data?.cover_original),
})
const lightboxImage = ref('')

const $isEdit = computed(() => (!!props.data))
const $submitLabel = computed(() => {
  if (props.processing) return '처리중'
  return $isEdit.value ? '수정하기' : '만들기'
})

async function onChangeMainFile(file)
{
  if (file)
  {
    forms.file = {
      name: file.name,
      type: file.type,
      size: file.size,
      date: file.lastModifiedDate,
    }
    files.main = file
    files.removedMain = false
  }
  else
  {
    forms.file = {}
    files.main = null
    files.removedMain = true
  }
}

function onUpdateCoverImage(src)
{
  const { coordinates, original, create, removedCover } = src
  if (removedCover)
  {
    forms.cover.coordinates = null
    files.coverOriginal = null
    files.coverCreate = null
  }
  else
  {
    if (forms.cover) forms.cover.coordinates = coordinates
    else forms.cover = { coordinates }
  }
  files.removedCover = Boolean(removedCover)
  if (original) files.coverOriginal = original
  if (create) files.coverCreate = create
}

function onOpenImage(file)
{
  if (!file) return
  lightboxImage.value = file
}

async function onSubmit()
{
  let json = {
    cover: forms.cover,
  }
  let body = {
    title: forms.title || '',
    description: forms.description || '',
    json: JSON.stringify(json),
  }
  if (forms.tags?.length > 0) body.tags = forms.tags.join(',')
  if (files.main && files.main instanceof File) body.file = files.main
  if (files.coverOriginal && files.coverOriginal instanceof File) body.cover_original = files.coverOriginal
  if (files.coverCreate && files.coverCreate instanceof File) body.cover_create = files.coverCreate
  body.remove_files = [
    files.removedMain && 'main',
    files.removedCover && 'cover-original',
    files.removedCover && 'cover-create',
  ].filter(Boolean).join(',')
  emits('submit', body)
}
</script>

<style src="./post.scss" lang="scss" scoped></style>
