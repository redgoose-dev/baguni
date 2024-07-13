<template>
<div class="explorer">
  <div class="explorer__wrap">
    <PageHeader title="에셋 탐색하기">
      바구니에서 등록한 에셋을 찾아봅니다.
      <template #side>
        <ButtonBasic
          size="small"
          left-icon="filter"
          :color="assets.filter.open ? 'key-3' : ''"
          class="explorer__toggle-filter"
          @click="toggleFilter">
          필터
        </ButtonBasic>
      </template>
    </PageHeader>
    <div :class="[
      'explorer__body',
      assets.filter.open && 'open-filter',
    ]">
      <div class="explorer__content">
        <LoadingScreen v-if="data.loading"/>
        <ul
          v-else-if="$index?.length > 0"
          :class="[
            'explorer__index',
            assets.filter.indexTheme === 'list' && 'list',
            assets.filter.indexTheme === 'thumbnail' && 'thumbnail',
          ]">
          <li v-for="item in $index">
            <ImageItem
              :to="`/asset/${item.id}/`"
              :image="item.thumbnail"
              :title="item.title"
              :meta="[ item.regdate ]"
              :theme="assets.filter.indexTheme"
              class="item">
              <template #body>
                <nav class="item-nav">
                  <router-link :to="`/asset/${item.id}/edit/`">수정</router-link>
                  <button
                    type="button"
                    @click.prevent="onClickManageCollection(item.id)">
                    컬렉션
                  </button>
                  <button
                    type="button"
                    @click.prevent="onClickRemove(item.id)">
                    삭제하기
                  </button>
                </nav>
              </template>
            </ImageItem>
          </li>
        </ul>
        <EmptyContent
          v-else
          message="에셋 데이터가 없습니다."
          class="explorer__empty"/>
        <nav class="explorer__paginate">
          <Paginate
            v-model="queryParams.page"
            :total="data.total"
            :size="assets.indexSize"
            :range="assets.paginateSize"
            @update:model-value="onChangePage"/>
        </nav>
      </div>
      <div class="explorer__filter">
        <Filter
          ref="_filter"
          :total="data.total"
          :q="queryParams.q"
          @update-keyword="onFilterUpdateKeyword"
          @update="fetch"
          @reset="onFilterReset"/>
      </div>
    </div>
  </div>
</div>
<teleport to="#modal">
  <Modal
    :open="collection.open"
    :hide-scroll="true"
    :use-shortcut="true"
    animation="bottom-up"
    @close="collection.open = false">
    <SelectCollection
      :asset-id="collection.assetId"
      @submit="collection.open = false"
      @close="collection.open = false"/>
  </Modal>
</teleport>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { assetStore } from '../../store/assets.js'
import { request, apiPath } from '../../libs/api.js'
import { serialize } from '../../libs/strings.js'
import { dateFormat, getDateRangeForQuery } from '../../libs/dates.js'
import { toast } from '../../modules/toast/index.js'
import PageHeader from '../../components/content/page-header.vue'
import Filter from './components/filter.vue'
import Paginate from '../../components/navigation/paginate.vue'
import ImageItem from '../../components/content/image/index.vue'
import LoadingScreen from '../../components/asset/loading/screen.vue'
import EmptyContent from '../../components/content/empty-content.vue'
import Modal from '../../components/modal/index.vue'
import ButtonBasic from '../../components/buttons/button-basic.vue'
import SelectCollection from '../collections/select-collection/index.vue'

const router = useRouter()
const route = useRoute()
const assets = assetStore()
const _filter = ref()
const data = reactive({
  loading: true,
  total: 0,
  index: [],
})
const queryParams = reactive({
  page: route.query?.page ? Number(route.query.page) : 1,
  q: route.query?.q || '',
})
const runFetch = ref(true)
const collection = reactive({
  assetId: undefined,
  open: false,
})

const $index = computed(() => {
  if (!(data.index?.length > 0)) return []
  return data.index.map(item => {
    const { id, title, description, cover_file_id, file_id, type, regdate } = item
    let thumbnail = cover_file_id ? `${apiPath}/file/${cover_file_id}/` : undefined
    if (!thumbnail && /^image/.test(type))
    {
      thumbnail = file_id ? `${apiPath}/file/${file_id}/?width=480&height=320&quality=75&type=cover` : undefined
    }
    return {
      id,
      title,
      description,
      thumbnail,
      regdate: dateFormat(new Date(regdate), '{yyyy}-{MM}-{dd}'),
    }
  })
})

onMounted(() => fetch())
watch(() => route.query, async (value, _oldValue) => {
  if ((Number(value.page) || 1) !== queryParams.page) queryParams.page = Number(value.page)
  if (value.q !== queryParams.q)
  {
    queryParams.q = value.q || ''
    _filter.value.updateSearchKeyword(queryParams.q)
  }
  fetch().then()
})

async function fetch()
{
  try
  {
    if (!runFetch.value) return
    data.loading = true
    let query = {
      page: queryParams.page,
      size: assets.indexSize,
      order: assets.filter.order || undefined,
      sort: assets.filter.sort || undefined,
      date_start: assets.filter.dateStart,
      date_end: assets.filter.dateEnd,
      file_type: assets.filter.fileType,
      tags: assets.filter.tags?.length > 0 ? assets.filter.tags.map(o => (o.id)).join(',') : undefined,
      q: queryParams.q,
    }
    // filtering query
    if (!(query.page > 1)) delete query.page
    if (!query.q) delete query.q
    if (!query.file_type || query.file_type === 'all') delete query.file_type
    if (!query.order || query.order === 'id') delete query.order
    if (!query.sort || query.sort === 'desc') delete query.sort
    if (!query.size || query.size === 24) delete query.size
    const dateRange = getDateRangeForQuery(query.date_start, query.date_end)
    if (dateRange)
    {
      query.date_start = dateRange.date_start
      query.date_end = dateRange.date_end
    }
    else
    {
      delete query.date_start
      delete query.date_end
    }
    // request api
    const res = await request(`/assets/`, {
      method: 'get',
      query,
    })
    // response data
    if (res?.data)
    {
      const { total, index } = res?.data
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
  catch (e)
  {
    toast.add(e.message, 'error').then()
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
  queryParams.page = page
  await router.push(`./${serialize(newQuery, true)}`)
}

async function onFilterUpdateKeyword(q)
{
  let { query } = route
  let newQuery = {
    ...query,
    page: undefined,
    q,
  }
  await router.push(`./${serialize(newQuery, true)}`)
}
async function onFilterReset()
{
  let { query } = route
  let newQuery = {
    ...query,
    page: 1,
    q: '',
  }
  if (newQuery.page === 1) delete newQuery.page
  queryParams.page = 1
  runFetch.value = false
  await router.push(`./${serialize(newQuery, true)}`)
  runFetch.value = true
  await fetch()
}

async function onClickRemove(id)
{
  if (!confirm('정말로 에셋을 삭제할까요? 삭제하면 다시 복구할 수 없습니다.')) return
  await request(`${apiPath}/asset/${id}/`, { method: 'delete' })
  toast.add('에셋을 삭제했습니다.', 'success').then()
  await fetch()
}

function onClickManageCollection(assetId)
{
  collection.assetId = assetId
  collection.open = true
}

function toggleFilter()
{
  assets.filter.open = !assets.filter.open
  assets.saveFilter()
}
</script>

<style src="./index.scss" lang="scss" scoped></style>
