<template>
<div class="explorer">
  <div class="explorer__wrap">
    <PageHeader title="에셋 탐색하기">
      바구니에서 등록한 에셋을 찾아봅니다.
    </PageHeader>
    <div class="explorer__body">
      <div class="explorer__content">
        <LoadingScreen v-if="data.loading"/>
        <ul
          v-else-if="$index?.length > 0"
          :class="[
            'explorer__index',
            filter.indexTheme === 'list' && 'list',
            filter.indexTheme === 'thumbnail' && 'thumbnail',
          ]">
          <li v-for="item in $index">
            <ImageItem
              :to="`/asset/${item.id}/`"
              :image="item.thumbnail"
              :title="item.title"
              :meta="[ item.regdate ]"
              :theme="filter.indexTheme"
              class="item">
              <template #body>
                <nav class="item-nav">
                  <router-link :to="`/asset/${item.id}/edit/`">
                    수정
                  </router-link>
                  <a
                    :href="`/asset/${item.id}/remove/`"
                    @click.prevent="onClickRemove(item.id)">
                    삭제하기
                  </a>
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
            v-model="params.page"
            :total="data.total"
            :size="params.size"
            :range="params.range"
            @update:model-value="onChangePage"/>
        </nav>
      </div>
      <div class="explorer__filter">
        <Filter
          :total="data.total"
          v-model:dateStart="filter.dateStart"
          v-model:dateEnd="filter.dateEnd"
          v-model:fileType="filter.fileType"
          v-model:order="filter.order"
          v-model:sort="filter.sort"
          v-model:indexTheme="filter.indexTheme"
          v-model:q="filter.q"
          @submit="onSubmitFilter"
          @reset="onResetFilter"/>
      </div>
    </div>
  </div>
</div>
</template>

<script setup>
import { reactive, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { request, apiPath } from '../../libs/api.js'
import { serialize } from '../../libs/strings.js'
import { pureObject } from '../../libs/objects.js'
import { dateFormat, getDateRangeForQuery } from '../../libs/dates.js'
import { toast } from '../../modules/toast/index.js'
import { defaultAssetsIndexFilter } from '../../libs/consts.js'
import PageHeader from '../../components/content/page-header.vue'
import Filter from './components/filter.vue'
import Paginate from '../../components/navigation/paginate.vue'
import ImageItem from '../../components/content/image/index.vue'
import LoadingScreen from '../../components/asset/loading/screen.vue'
import EmptyContent from '../../components/content/empty-content.vue'

const router = useRouter()
const route = useRoute()
const data = reactive({
  loading: true,
  total: 0,
  index: [],
})
const params = reactive({
  range: 8,
  size: 6,
  page: route.query?.page ? Number(route.query.page) : 1,
})
const filter = reactive({
  ...pureObject(defaultAssetsIndexFilter),
  // TODO: 나중에 스토리지 값으로 덮어씌운다.
  // dateStart: undefined,
  // dateEnd: undefined,
  // fileType: 'all',
  // order: 'id',
  // sort: 'desc',
  // q: route.query?.q || undefined,
  // indexTheme: 'thumbnail', // list,thumbnail
})

const $index = computed(() => {
  if (!(data.index?.length > 0)) return []
  return data.index.map(item => {
    const { id, title, description, cover_file_id, regdate } = item
    return {
      id,
      title,
      description,
      thumbnail: cover_file_id ? `${apiPath}/file/${cover_file_id}/` : null,
      regdate: dateFormat(new Date(regdate), '{yyyy}-{MM}-{dd}'),
    }
  })
})

onMounted(() => {
  fetch().then()
})

async function fetch(options = {})
{
  data.loading = true
  let query = {
    page: params.page,
    size: params.size,
    order: filter.order || undefined,
    sort: filter.sort || undefined,
    q: filter.q,
    date_start: filter.dateStart,
    date_end: filter.dateEnd,
    file_type: filter.fileType,
    ...options,
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

async function onChangePage(page)
{
  let { query } = route
  let newQuery = {
    ...query,
    page,
  }
  if (newQuery.page === 1) delete newQuery.page
  params.page = page
  await router.push(`./${serialize(newQuery, true)}`)
  await fetch()
}

async function onClickRemove(id)
{
  if (!confirm('정말로 에셋을 삭제할까요? 삭제하면 다시 복구할 수 없습니다.')) return
  await request(`${apiPath}/asset/${id}/`, { method: 'delete' })
  toast.add('에셋을 삭제했습니다.', 'success').then()
  await fetch()
}

async function onSubmitFilter()
{
  let { query } = route
  // TODO: 로컬 스토리지 업데이트
  // reset query
  let newQuery = { ...query, page: undefined }
  params.page = 1
  await router.replace(`./${serialize(newQuery, true)}`)
  // call fetch
  await fetch()
}
async function onResetFilter()
{
  let { query } = route
  // reset filter
  let newFilter = pureObject(defaultAssetsIndexFilter)
  Object.entries(newFilter).forEach(([ key, value ]) => {
    filter[key] = value
  })
  // TODO: 로컬 스토리지 업데이트
  // reset query
  let newQuery = { ...query, page: undefined }
  params.page = 1
  await router.replace(`./${serialize(newQuery, true)}`)
  // call fetch
  await fetch()
}
</script>

<style src="./index.scss" lang="scss" scoped></style>
