<template>
<article class="create-asset">
  <div class="create-asset__wrap">
    <PageHeader title="에셋 만들기">
      새로운 에셋을 만듭니다.
    </PageHeader>
    <Post
      :processing="processing"
      @submit="onSubmit"/>
  </div>
</article>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { error, success } from '../../libs/reactions.js'
import { request, formData } from '../../libs/api.js'
import AppError from '../../modules/AppError.js'
import PageHeader from '../../components/content/page-header.vue'
import Post from './components/post.vue'

const router = useRouter()
const processing = ref(false)

async function onSubmit(body)
{
  try
  {
    // on processing
    processing.value = true
    // 에셋파일이 없으면 오류로 처리한다.
    if (!body.file) throw new AppError('에셋 파일이 없습니다.')
    // API 요청
    await request('/asset/', {
      method: 'post',
      body: formData(body),
    })
    // off processing
    processing.value = false
    // reaction
    success('에셋을 만들었습니다.')
    // go to index
    await router.push('/')
  }
  catch (e)
  {
    error('에셋을 만들지 못했습니다.', e)
    processing.value = false
  }
}
</script>

<style lang="scss" scoped>
.create-asset {
  margin: var(--size-content-margin-top) 0 0;
  padding: 0 var(--size-side-padding);
  &__wrap {
    margin: 0 auto;
    max-width: var(--size-content-width);
  }
}
</style>
