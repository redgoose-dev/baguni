<template>
<form class="post" @submit.prevent="">
  <aside class="post__side">
    <UploadFile class="upload"/>
    <ManageCoverImage class="cover-image"/>
  </aside>
  <div class="post__body">
    <fieldset class="field">
      <legend class="hidden">제목 입력 폼</legend>
      <label for="title">제목</label>
      <div class="body">
        <InputText
          name="title"
          id="title"/>
      </div>
    </fieldset>
    <fieldset class="field">
      <legend class="hidden">설명 입력 폼</legend>
      <label for="description">설명을 입력해주세요.</label>
      <div class="body">
        <Textarea
          name="description"
          id="description"/>
      </div>
    </fieldset>
    <ManageTags/>
    <nav class="submit">
      <Button
        type="submit"
        size="big"
        color="key-1">
        {{submitLabel}}
      </Button>
    </nav>
  </div>
</form>
</template>

<script setup>
import { ref, computed } from 'vue'
import Button from '../../../components/buttons/button-basic.vue'
import UploadFile from './upload-file.vue'
import ManageCoverImage from './manage-cover-image.vue'
import ManageTags from './manage-tags.vue'
import InputText from '../../../components/form/input-text.vue'
import Textarea from '../../../components/form/textarea.vue'

const props = defineProps({
  mode: { type: String, required: true }, // create,edit
})

const submitLabel = computed(() => {
  switch (props.mode)
  {
    case 'create': return '등록하기'
    case 'edit': return '수정하기'
  }
})
</script>

<style src="./post.scss" lang="scss" scoped></style>
