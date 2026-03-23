<template>
<article class="token">
  <div class="token__wrap">
    <PageHeader title="엑세스 토큰">
      엑세스 토큰을 관리합니다.
      <template #side>
        <ButtonBasic
          color="key-1"
          left-icon="plus"
          @click="data.windowCreateToken = true">
          만들기
        </ButtonBasic>
      </template>
    </PageHeader>
    <div class="content">
      <LoadingScreen v-if="data.loading"/>
      <ul v-else-if="_index?.length > 0" class="index">
        <li v-for="item in _index">
          <Card
            :id="item.id"
            :token="item.token"
            :expired="item.expired"
            :name="item.name"
            :created-at="item.created_at"
            @expire-token="onExpireToken"/>
        </li>
      </ul>
      <EmptyContent
        v-else
        message="토큰 데이터가 없습니다."
        class="empty"/>
      <nav class="paginate">
        <Paginate
          :model-value="queryParams.page"
          :total="data.total"
          :size="_status.size"
          :range="10"
          @update:model-value="onChangePage"/>
      </nav>
    </div>
  </div>
</article>
<teleport to="#modal">
  <Modal
    :open="data.windowCreateToken"
    :hide-scroll="true"
    :use-shortcut="true"
    animation="bottom-up"
    @close="data.windowCreateToken = false">
    <CreateToken
      @submit="fetch"
      @close="data.windowCreateToken = false"/>
  </Modal>
</teleport>
</template>

<script setup>
import { reactive, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { authStore, assetStore } from '../../store/index.js'
import { request } from '../../libs/api.js'
import { serialize } from '../../libs/strings.js'
import { toast } from '../../modules/toast/index.js'
import PageHeader from '../../components/content/page-header.vue'
import LoadingScreen from '../../components/asset/loading/screen.vue'
import EmptyContent from '../../components/content/empty-content.vue'
import Paginate from '../../components/navigation/paginate.vue'
import Card from './components/card.vue'
import ButtonBasic from "../../components/buttons/button-basic.vue";
import Modal from '../../components/modal/index.vue'
import CreateToken from './components/create-token.vue'

const router = useRouter()
const route = useRoute()
const auth = authStore()
const asset = assetStore()
const data = reactive({
  loading: true,
  total: 0,
  index: [],
  windowCreateToken: false,
})
const queryParams = reactive({
  page: route.query?.page ? Number(route.query.page) : 1,
})

const _status = computed(() => {
  return {
    size: auth.preference?.token?.pagePerCount || 24,
  }
})
const _index = computed(() => {
  if (!(data.index?.length > 0)) return []
  return data.index.map(item => {
    return item
  })
})

onMounted(() => fetch())
watch(() => route.query, async (value, _oldValue) => {
  let updated = false
  if (Number(value.page || 1) !== Number(queryParams.page || 1))
  {
    updated = true
    queryParams.page = Number(value.page)
  }
  if (updated) await fetch()
})

async function fetch()
{
  try
  {
    data.loading = true
    let query = {
      page: queryParams.page,
      size: _status.value.size,
      order: 'id',
      sort: 'desc',
    }
    if (!(query.page > 1)) delete query.page
    if (!query.order || query.order === 'id') delete query.order
    if (!query.sort || query.sort === 'desc') delete query.sort
    if (!query.size || query.size === 24) delete query.size
    // request api
    const res = await request(`/token/`, {
      method: 'get',
      query,
    })
    // response data
    if (res?.data)
    {
      const { total, index } = res.data
      data.total = total
      data.index = index
    }
    else
    {
      data.total = 0
      data.index = []
    }
    data.loading = false
  }
  catch (_e)
  {
    toast.add(_e.message, 'error').then()
    data.loading = false
  }
}

async function onChangePage(page)
{
  let { query } = route
  let newQuery = {
    ...query,
    page,
  }
  if (newQuery.page === 1) delete newQuery.page
  await router.push(`./${serialize(newQuery, true)}`)
}

async function onExpireToken(id)
{
  if (!confirm('정말로 토큰을 만료시킬까요?\n토큰을 만료하면 복구할 수 없습니다.')) return
  try
  {
    await request(`/token/${id}/`, {
      method: 'delete',
    })
    fetch().then()
    toast.add('토큰을 만료했습니다.', 'success').then()
  }
  catch (_e)
  {
    toast.add('토큰을 만료하지 못했습니다.', 'error').then()
  }
}
</script>

<style src="./index.scss" lang="scss" scoped></style>
