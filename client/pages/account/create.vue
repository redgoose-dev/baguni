<template>
<article class="create-account">
  <div class="create-account__wrap">
    <PageHeader title="계정 만들기">
      새로운 비밀번호 타입의 계정을 만듭니다.
    </PageHeader>
    <Post :processing="processing" @submit="onSubmit"/>
  </div>
</article>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authStore } from '../../store/index.js'
import { error, success } from '../../libs/reactions.js'
import { request, formData } from '../../libs/api.js'
import PageHeader from '../../components/content/page-header.vue'
import Post from './components/post.vue'

const router = useRouter()
const auth = authStore()
const processing = ref(false)

async function onSubmit(body)
{
  try
  {
    processing.value = true
    const res = await request('/provider/', {
      method: 'put',
      body: formData(body),
    })
    if (!res?.data?.id) throw new Error('만들어진 계정 ID가 없습니다.')
    success('계정을 만들었습니다.')
    await router.push(`/account/`)
  }
  catch (_e)
  {
    error('계정을 만들지 못했습니다.', _e)
  }
  finally
  {
    processing.value = false
  }
}
</script>

<style lang="scss" scoped>
.create-account {
  margin: var(--size-content-margin-top) 0 0;
  padding: 0 var(--size-side-padding);
  &__wrap {
    margin: 0 auto;
    max-width: var(--size-content-width);
  }
}
</style>
