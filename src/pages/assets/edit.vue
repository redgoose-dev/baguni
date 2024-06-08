<template>
<article class="edit-asset">
  <PageHeader title="에셋 수정하기">
    에셋을 데이터를 수정합니다.
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
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { error, success } from '../../libs/reactions.js'
import { request, formData } from '../../libs/api.js'
import PageHeader from '../../components/content/page-header.vue'
import Post from './components/post.vue'
import LoadingScreen from '../../components/asset/loading/screen.vue'

const router = useRouter()
const route = useRoute()
const ready = ref(true)
const processing = ref(false)
const data = ref({})

onMounted(async () => {
  ready.value = true
  const { id } = route.params
  if (!id) throw new Error('에셋 아이디가 없습니다.')
  const res = await request(`/asset/${id}/`, {
    method: 'get',
  })
  if (!res?.data) throw new Error('에셋 데이터가 없습니다.')
  const { title, description, files, json, tags } = res.data
  data.value = {
    id: Number(id),
    title,
    description,
    tags,
    json,
    file: files.main,
    cover_original: files.coverOriginal,
    cover_create: files.coverCreate,
  }
  ready.value = false
})

async function onSubmit(body)
{
  try
  {
    processing.value = true
    console.log('onSubmit()', body)
    processing.value = false
  }
  catch (e)
  {
    processing.value = false
  }
}
</script>

<style lang="scss" scoped>
.edit-asset {
  margin: 0 auto;
  max-width: var(--size-content-width);
}
</style>
