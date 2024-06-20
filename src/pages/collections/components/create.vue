<template>
<article class="create">
  <PageHeader title="컬렉션 만들기">
    새로운 컬렉션을 만듭니다.
  </PageHeader>
  <PostCollection
    :processing="processing"
    class="post"
    @submit="onSubmit"/>
  <ModalClose @click="emits('close')"/>
</article>
</template>

<script setup>
import { ref } from 'vue'
import { request, formData } from '../../../libs/api.js'
import { error, success } from '../../../libs/reactions.js'
import PageHeader from '../../../components/content/page-header.vue'
import PostCollection from '../components/post.vue'
import ModalClose from '../../../components/modal/close.vue'

const emits = defineEmits([ 'submit', 'close' ])
const processing = ref(false)

async function onSubmit(body)
{
  try
  {
    // on processing
    processing.value = true
    // API 요청
    await request('/collection/', {
      method: 'post',
      body: formData(body)
    })
    // off processing
    processing.value = false
    // reaction
    success('컬렉션을 만들었습니다.')
    emits('submit')
  }
  catch (e)
  {
    error('컬렉션을 만들지 못했습니다.', e)
    processing.value = false
  }
}
</script>

<style lang="scss" scoped>
.create {
  padding: var(--size-modal-window-padding);
  box-sizing: border-box;
  width: 75vw;
  max-width: 640px;
}
.post {
  margin: 30px 0 0;
}
</style>
