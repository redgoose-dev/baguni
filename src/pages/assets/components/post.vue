<template>
<form class="post" @submit.prevent="onSubmit">
  <aside class="post__side">
    <UploadFile
      :meta="forms.mainFile"
      :file="files.main"
      class="upload"
      @change-file="onChangeMainFile"
      @update-meta="onUpdateMainFileMeta"
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
    <pre class="pre-code">{{forms}}</pre>
    <nav class="submit">
      <Button
        type="submit"
        size="big"
        color="key-1"
        :disabled="processing"
        :rotate-icon="processing"
        :left-icon="processing ? 'loader' : 'check'">
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
import { request } from '../../../libs/api.js'
import Button from '../../../components/buttons/button-basic.vue'
import UploadFile from './upload-file.vue'
import ManageCoverImage from './manage-cover-image.vue'
import ManageTags from './manage-tags.vue'
import InputText from '../../../components/form/input-text.vue'
import Textarea from '../../../components/form/textarea.vue'
import Lightbox from '../../../components/content/lightbox/index.vue'

const props = defineProps({
  mode: { type: String, required: true }, // create,edit
})
const forms = reactive({
  title: '',
  description: '',
  tags: [],
  mainFile: {},
  cover: {
    coordinates: null,
  },
})
const files = reactive({
  main: undefined,
  coverOriginal: undefined,
  coverCreate: undefined,
})
const processing = ref(false)
const lightboxImage = ref('')

const $submitLabel = computed(() => {
  if (processing.value) return '처리중'
  switch (props.mode)
  {
    case 'create': return '등록하기'
    case 'edit': return '수정하기'
  }
})

async function onChangeMainFile(file)
{
  if (file)
  {
    forms.mainFile = {
      name: file.name,
      type: file.type,
      size: file.size,
      date: file.lastModifiedDate,
    }
    files.main = file
  }
  else
  {
    forms.mainFile = {}
    files.main = undefined
  }
}
function onUpdateMainFileMeta(newValue)
{
  forms.mainFile.name = newValue.name
}

function onUpdateCoverImage(src)
{
  const { coordinates, original, create, removed } = src
  if (removed)
  {
    forms.cover.coordinates =  null
    files.coverOriginal = null
    files.coverCreate = null
  }
  forms.cover.coordinates = coordinates
  if (original) files.coverOriginal = original
  files.coverCreate = create
}

function onOpenImage(file)
{
  if (!file) return
  lightboxImage.value = file
}

async function onSubmit()
{
  try
  {
    processing.value = true
    console.log('on submit')
    processing.value = false
  }
  catch (e)
  {
    processing.value = false
  }
}
</script>

<style src="./post.scss" lang="scss" scoped></style>
