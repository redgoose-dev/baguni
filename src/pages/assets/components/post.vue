<template>
<form class="post" @submit.prevent="onSubmit">
  <aside class="post__side">
    <UploadFile
      :meta="forms.mainFile"
      :file="files.main"
      class="upload"
      @update="updateMainFile"
      @open="openMainFile"/>
    <ManageCoverImage
      class="cover-image"/>
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
        :disabled="processing"
        :rotate-icon="processing"
        :left-icon="processing ? 'loader' : 'check'">
        {{processing ? '처리중' : submitLabel}}
      </Button>
    </nav>
    <pre class="pre-code">{{forms}}</pre>
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
  mainFile: undefined,
})
const files = reactive({
  main: undefined,
  coverOriginal: undefined,
  coverCreate: undefined,
})
const processing = ref(false)
const lightboxImage = ref('')

const submitLabel = computed(() => {
  switch (props.mode)
  {
    case 'create': return '등록하기'
    case 'edit': return '수정하기'
  }
})

async function updateMainFile(file)
{
  if (file)
  {
    forms.mainFile = {
      name: file.name,
      size: file.size,
      type: file.type,
      date: file.lastModifiedDate,
    }
    files.main = file
  }
  else
  {
    forms.mainFile = undefined
    files.main = undefined
  }
}

function openMainFile(file)
{
  lightboxImage.value = URL.createObjectURL(file)
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
