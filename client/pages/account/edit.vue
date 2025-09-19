<template>
<article class="edit-account">
  <div class="edit-account__wrap">
    <PageHeader title="계정 수정하기">
      비밀번호 타입의 계정을 수정합니다.
    </PageHeader>
    <Post
      v-if="state.data"
      :processing="state.processing"
      :data="state.data"
      @submit="onSubmit"/>
    <EmptyContent v-else message="계정 데이터가 없습니다."/>
  </div>
</article>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { error, success } from '../../libs/reactions.js'
import { request, formData } from '../../libs/api.js'
import { authStore } from '../../store/index.js'
import PageHeader from '../../components/content/page-header.vue'
import Post from './components/post.vue'
import EmptyContent from '../../components/content/empty-content.vue'

const router = useRouter()
const route = useRoute()
const auth = authStore()
const state = reactive({
  loading: true,
  processing: false,
  data: null,
})

onMounted(async () => {
  try
  {
    const { id } = route.params
    const res = await request(`/provider/${id}/`)
    if (res.data.code !== 'password')
    {
      throw new Error('비밀번호 타입의 계정이 아닙니다.')
    }
    state.data = res.data
  }
  catch (_e)
  {
    error('계정 데이터를 불러오지 못했습니다.', _e)
  }
  finally
  {
    state.loading = false
  }
})

async function onSubmit(body)
{
  try
  {
    state.processing = true
    await request(`/provider/${route.params.id}/`, {
      method: 'patch',
      body: formData(body),
    })
    success('계정을 수정했습니다.')
    await auth.update(body)
    router.push('/account/').then()
  }
  catch (_e)
  {
    error('계정을 수정하지 못했습니다.', _e)
  }
  finally
  {
    state.processing = false
  }
}
</script>

<style lang="scss" scoped>
.edit-account {
  margin: var(--size-content-margin-top) 0 0;
  padding: 0 var(--size-side-padding);
  &__wrap {
    margin: 0 auto;
    max-width: var(--size-content-width);
  }
}
</style>
