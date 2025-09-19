<template>
<article class="edit">
  <PageHeader title="컬렉션 수정하기">
    컬렉션을 수정합니다.
  </PageHeader>
  <LoadingScreen v-if="loading"/>
  <PostCollection
    v-else
    :data="data"
    :processing="processing"
    class="post"
    @submit="onSubmit"/>
  <ModalClose @click="emits('close')"/>
</article>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { request, formData } from '../../../libs/api.js'
import { error, success } from '../../../libs/reactions.js'
import PageHeader from '../../../components/content/page-header.vue'
import PostCollection from '../components/post.vue'
import ModalClose from '../../../components/modal/close.vue'
import LoadingScreen from '../../../components/asset/loading/screen.vue'

const props = defineProps({
  id: Number,
})
const emits = defineEmits([ 'submit', 'close' ])
const loading = ref(true)
const processing = ref(false)
const data = ref({})

onMounted(async () => {
  try
  {
    loading.value = true
    if (!props.id) throw new Error('컬렉션 아이디가 없습니다.')
    const res = await request(`/collection/${props.id}/`, {
      method: 'get',
    })
    if (!res?.data) throw new Error('컬렉션 데이터가 없습니다.')
    const { title, description, files } = res.data
    data.value = {
      id: props.id,
      title,
      description,
      cover_create: files.coverCreate,
    }
    loading.value = false
  }
  catch (e)
  {
    error('컬렉션 데이터를 가져올 수 없습니다.', e)
    emits('close')
  }
})

async function onSubmit(body)
{
  try
  {
    // on processing
    processing.value = true
    // API 요청
    await request(`/collection/${props.id}/`, {
      method: 'patch',
      body: formData(body),
    })
    // off processing
    processing.value = false
    // reaction
    success('컬렉션을 수정했습니다.')
    emits('submit')
  }
  catch (e)
  {
    error('컬렉션을 수정하지 못했습니다.', e)
    processing.value = false
  }
}
</script>

<style lang="scss" scoped>
.edit {
  padding: 54px;
  box-sizing: border-box;
  width: 75vw;
  max-width: 640px;
}
.post {
  margin: 30px 0 0;
}
</style>
