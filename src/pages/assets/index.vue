<template>
<div class="explorer">
  <div class="explorer__wrap">
    <PageHeader title="에셋 탐색하기">
      바구니에서 등록한 에셋을 찾아봅니다.
    </PageHeader>
    <div class="explorer__body">
      <div class="explorer__content">
        <IndexFilter
          v-model:order="headFilter.order"
          v-model:sort="headFilter.sort"
          v-model:theme="display.indexTheme"/>
        <LoadingScreen v-if="data.loading"/>
        <ul
          v-else-if="$index?.length > 0"
          :class="[
            'explorer__index',
            display.indexTheme === 'list' && 'list',
            display.indexTheme === 'thumbnail' && 'thumbnail',
          ]">
          <li v-for="item in $index">
            <ImageItem
              :to="`/asset/${item.id}/`"
              :image="item.thumbnail"
              :title="item.title"
              :meta="[ item.regdate ]"
              :theme="display.indexTheme"
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
        <EmptyContent v-else class="explorer__empty"/>
        <nav class="explorer__paginate">
          <Paginate
            v-model="routeQuery.page"
            :total="data.total"
            :size="sideFilter.size"
            :range="display.paginateRange"
            @update:model-value="onChangePage"/>
        </nav>
      </div>
      <div class="explorer__filter">
        <Filter
          :total="data.total"
          v-model:date-start="sideFilter.dateStart"
          v-model:date-end="sideFilter.dateEnd"
          v-model:file-type="sideFilter.fileType"
          v-model:q="routeQuery.q"
          @submit="onSubmitSideFilter"/>
      </div>
    </div>
  </div>
  <div>
    <pre style="font-size:11px">{{display}}</pre>
    <pre style="font-size:11px">{{headFilter}}</pre>
    <pre style="font-size:11px">{{sideFilter}}</pre>
    <pre style="font-size:11px">{{routeQuery}}</pre>
  </div>
</div>
</template>

<script setup>
import { reactive, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { request, apiPath } from '../../libs/api.js'
import { serialize } from '../../libs/strings.js'
import { dateFormat } from '../../libs/dates.js'
import { toast } from '../../modules/toast/index.js'
import PageHeader from '../../components/content/page-header.vue'
import Filter from './components/filter.vue'
import IndexFilter from './components/index-filter.vue'
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
const display = reactive({
  indexTheme: 'thumbnail', // list,thumbnail
  paginateRange: 8,
})
const sideFilter = reactive({
  dateStart: undefined,
  dateEnd: undefined,
  fileType: 'all',
  size: 6,
})
const headFilter = reactive({
  order: 'id',
  sort: 'desc',
})
const routeQuery = reactive({
  page: route.query?.page ? Number(route.query.page) : 1,
  q: route.query?.q || undefined,
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
watch(headFilter, (value, _oldValue) => onUpdateFilter())

async function fetch(options = {})
{
  data.loading = true
  let query = {
    page: routeQuery.page,
    size: 6,
    order: headFilter.order || undefined,
    sort: headFilter.sort || undefined,
    q: routeQuery.q,
    date_start: sideFilter.dateStart,
    date_end: sideFilter.dateEnd,
    file_type: sideFilter.fileType,
    ...options,
  }
  // filtering query
  if (!(query.page > 1)) delete query.page
  if (!query.q) delete query.q
  if (!query.file_type || query.file_type === 'all') delete query.file_type
  if (!query.order || query.order === 'id') delete query.order
  if (!query.sort || query.sort === 'desc') delete query.sort
  if (!query.size || query.size === 24) delete query.size
  if (!(query.date_start && query.date_end))
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
  const { total, index } = res.data
  data.total = total
  data.index = index
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
  routeQuery.page = page
  await router.push(`./${serialize(newQuery, true)}`)
  await fetch()
}
async function onSubmitSideFilter(q)
{
  let { query } = route
  let newQuery = {
    ...query,
    page: undefined,
    q,
  }
  routeQuery.page = 1
  await router.push(`./${serialize(newQuery, true)}`)
  await fetch()
}
async function onUpdateFilter()
{
  let { query } = route
  let newQuery = {
    ...query,
    page: undefined,
  }
  routeQuery.page = 1
  await router.replace(`./${serialize(newQuery, true)}`)
  await fetch()
}

async function onClickRemove(id)
{
  if (!confirm('정말로 에셋을 삭제할까요? 삭제하면 다시 복구할 수 없습니다.')) return
  await request(`${apiPath}/asset/${id}/`, { method: 'delete' })
  toast.add('에셋을 삭제했습니다.', 'success').then()
  await fetch()
}
</script>

<style src="./index.scss" lang="scss" scoped></style>
