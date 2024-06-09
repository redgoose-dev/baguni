<template>
<div class="explorer">
  <div class="explorer__wrap">
    <PageHeader title="에셋 탐색하기">
      바구니에서 등록한 에셋을 찾아봅니다.
    </PageHeader>
    <div class="explorer__body">
      <div class="explorer__content">
        <IndexFilter @update="onUpdateIndexFilter"/>
        <LoadingScreen v-if="loading"/>
        <ul v-else :class="[
          'explorer__index',
          display.indexTheme === 'list' && 'list',
          display.indexTheme === 'thumbnail' && 'thumbnail',
        ]">
          <li v-for="item in $index">
            <ImageItem
              :to="`/asset/${item.id}/`"
              :image="item.thumbnail"
              :title="item.title"
              :meta="[
                item.regdate,
              ]"
              :theme="display.indexTheme"
              class="item">
              <template #body>
                <nav class="item-nav">
                  <router-link :to="`/asset/edit/${item.id}/`">
                    수정
                  </router-link>
                  <a
                    :href="`/asset/remove/${item.id}/`"
                    @click.prevent="onClickRemove(item.id)">
                    삭제하기
                  </a>
                </nav>
              </template>
            </ImageItem>
          </li>
        </ul>
        <nav class="explorer__paginate">
          <Paginate
            v-model="data.page"
            :total="data.total"
            :size="display.size"
            :range="8"
            @update:model-value="onChangePage"/>
        </nav>
      </div>
      <div class="explorer__filter">
        <Filter
          :total="data.total"/>
      </div>
    </div>
  </div>
</div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { request, apiPath } from '../../libs/api.js'
import { serialize } from '../../libs/strings.js'
import { dateFormat } from '../../libs/dates.js'
import AppError from '../../modules/AppError.js'
import { toast } from '../../modules/toast/index.js'
import PageHeader from '../../components/content/page-header.vue'
import Filter from './components/filter.vue'
import IndexFilter from './components/index-filter.vue'
import Paginate from '../../components/navigation/paginate.vue'
import ImageItem from '../../components/content/image/index.vue'
import LoadingScreen from '../../components/asset/loading/screen.vue'

const router = useRouter()
const route = useRoute()
const loading = ref(true)
const data = reactive({
  loading: false,
  total: 0,
  index: [],
  page: route.query?.page ? Number(route.query.page) : 1,
})
const display = reactive({
  size: 4,
  indexTheme: 'thumbnail', // list,thumbnail
  order: 'id',
  sort: 'desc',
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
watch(() => route.query, async (value, _oldValue) => {
  const { page } = value
  data.page = page ? Number(page) : 1
  await fetch()
})

async function fetch()
{
  loading.value = true
  const res = await request(`/assets/`, {
    method: 'get',
    query: {
      page: data.page,
      size: display.size,
      order: display.order,
      sort: display.sort,
    },
  })
  const { total, index } = res.data
  data.total = total
  data.index = index
  loading.value = false
}

function onUpdateIndexFilter(newValue)
{
  display.indexTheme = newValue.theme
}

function onChangePage(page)
{
  let { query } = route
  let newQuery = {
    ...query,
    page,
  }
  if (newQuery.page === 1) delete newQuery.page
  router.push(`./${serialize(newQuery, true)}`).then()
}

function onClickShare(id)
{
  console.log('onClickShare()', id)
}

async function onClickRemove(id)
{
  if (!confirm('에셋을 삭제할까요? 삭제하면 다시 복구할 수 없습니다.')) return
  await request(`${apiPath}/asset/${id}/`, { method: 'delete' })
  toast.add('에셋을 삭제했습니다.', 'success').then()
  await fetch()
}
</script>

<style src="./index.scss" lang="scss" scoped></style>
