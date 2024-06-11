<template>
<article class="edit-collection">
  <PageHeader title="컬렉션 수정하기">
    컬렉션을 수정합니다.
  </PageHeader>
  <LoadingScreen v-if="ready"/>
  <Post
    v-else
    :data="data"
    :processing="processing"
    @submit="onSubmit"/>
</article>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { error, success } from '../../libs/reactions.js'
import { request, formData } from '../../libs/api.js'
import PageHeader from '../../components/content/page-header.vue'
import Post from './components/post.vue'
import AppError from '../../modules/AppError.js'
import LoadingScreen from '../../components/asset/loading/screen.vue'

const router = useRouter()
const route = useRoute()
const ready = ref(true)
const processing = ref(false)
const data = ref({})

onMounted(async () => {
  ready.value = true
  const { id } = route.params
  if (!id) throw new AppError('컬렉션 아이디가 없습니다.', 204)
  const res = await request(`/collection/${id}/`, {
    method: 'get',
  })
  if (!res?.data) throw new AppError('에셋 데이터가 없습니다.', 204)
  const { title, description, files } = res.data
  data.value = {
    id: Number(id),
    title,
    description,
    cover_create: files.coverCreate,
  }
  ready.value = false
})

async function onSubmit(body)
{
  const { id } = route.params
  try
  {
    // on processing
    processing.value = true
    // API 요청
    await request(`/collection/${id}/`, {
      method: 'put',
      body: formData(body),
    })
    // off processing
    processing.value = false
    // reaction
    success('컬렉션을 수정했습니다.')
    // redirect
    if (router.options.history?.state?.back)
    {
      await router.push(String(router.options.history.state.back))
    }
    else
    {
      await router.push(`/collection/`)
    }
  }
  catch (e)
  {
    error('컬렉션을 수정하지 못했습니다.', e)
    processing.value = false
  }
}
</script>

<style lang="scss" scoped>
.edit-collection {
  margin: 0 auto;
  max-width: var(--size-content-width);
}
</style>
