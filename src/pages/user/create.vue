<template>
<article class="create-user">
  <div class="create-user__wrap">
    <PageHeader title="계정 만들기">
      새로운 계정을 만듭니다.
    </PageHeader>
    <Post
      :processing="processing"
      @submit="onSubmit"/>
  </div>
</article>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { error, success } from '../../libs/reactions.js'
import { request, formData } from '../../libs/api.js'
import { authStore } from '../../store/auth.js'
import PageHeader from '../../components/content/page-header.vue'
import Post from './components/post.vue'

const router = useRouter()
const auth = authStore()
const processing = ref(false)

async function onSubmit(body)
{
  try
  {
    // on processing
    processing.value = true
    // API 요청
    const res = await request('/user/', {
      method: 'post',
      body,
    })
    if (!res?.data?.userId) throw new Error('계정 ID가 없습니다.')
    // off processing
    processing.value = false
    // reaction
    success('계정을 만들었습니다.')
    // go to index
    await router.push(`/user/${res.data.userId}/`)
  }
  catch (e)
  {
    error('계정을 만들지 못했습니다.', e)
    processing.value = false
  }
}
</script>

<style src="./create.scss" lang="scss" scoped></style>
