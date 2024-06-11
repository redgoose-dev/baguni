<template>
<article class="create-collection">
  <PageHeader title="컬렉션 만들기">
    새로운 컬렉션을 만듭니다.
  </PageHeader>
  <Post
    :processing="processing"
    @submit="onSubmit"/>
</article>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { apiPath, request, formData } from '../../libs/api.js'
import { error, success } from '../../libs/reactions.js'
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
    // API 요청
    await request('/collection/', {
      method: 'post',
      body: formData(body)
    })
    // off processing
    processing.value = false
    // reaction
    success('컬렉션을 만들었습니다.')
    // go to index
    await router.push('/collections/')
  }
  catch (e)
  {
    error('컬렉션을 만들지 못했습니다.', e)
    processing.value = false
  }
}
</script>

<style lang="scss" scoped>
.create-collection {
  margin: 0 auto;
  max-width: var(--size-content-width);
}
</style>
