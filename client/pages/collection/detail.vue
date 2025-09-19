<template>
<article class="collection">
  <div class="collection__wrap">
    <PageHeader title="컬렉션 에셋">
      컬렉션에 담겨있는 에셋의 목록입니다.
    </PageHeader>
    <LoadingScreen v-if="data.loading"/>
    <div v-else-if="$collection" class="collection__body">
      <ShadowBox tag="article" class="info">
        <figure class="info__image">
          <img
            v-if="$collection.thumbnail"
            :src="$collection.thumbnail"
            draggable="false"
            :alt="$collection.title"/>
          <i v-else>
            <Icon name="image"/>
          </i>
        </figure>
        <div class="info__body">
          <h2 class="info__title">{{$collection.title}}</h2>
          <p class="info__description">{{$collection.description}}</p>
          <p class="info__meta">
            <span>{{$collection.regdate}}</span>
          </p>
        </div>
        <nav class="info__nav">
          <Dropdown
            :use-value="true"
            position="right"
            class="dropdown">
            <Context
              :items="[
                { key: 'edit', label: '수정', icon: 'edit' },
                { key: 'remove', label: '삭제', icon: 'trash-2', color: 'danger' },
              ]"
              @select="onSelectCollectionContext"/>
          </Dropdown>
        </nav>
      </ShadowBox>
      <div class="index-head">
        <p class="index-head__total">총 <strong>{{$assets.total}}</strong>개의 에셋이 있습니다.</p>
      </div>
      <LoadingScreen v-if="data.assets.loading"/>
      <ul v-else-if="$assets.index?.length > 0" class="index">
        <li v-for="o in $assets.index">
          <ImageItem
            :to="`/asset/${o.id}/`"
            :image="o.thumbnail"
            :title="o.title"
            :meta="[ o.regdate ]"
            theme="thumbnail"
            class="item">
            <template #body>
              <nav class="item-nav">
                <router-link :to="`/asset/${o.id}/edit/`">수정</router-link>
                <button
                  type="button"
                  @click.prevent="removeAssetInCollection(o.id)">
                  컬렉션에서 제거
                </button>
              </nav>
            </template>
          </ImageItem>
        </li>
      </ul>
      <EmptyContent
        v-else
        message="에셋이 없습니다."
        class="empty"/>
      <div v-if="$assets.total > 0" class="collection__paginate">
        <Paginate
          v-model="data.page"
          :total="data.assets.total"
          :size="display.size"
          :range="8"
          @update:model-value="onChangePage"/>
      </div>
      <NavigationBottom class="bottom">
        <template #center>
          <ButtonBasic href="/collection/" left-icon="list" size="big">
            컬렉션 목록
          </ButtonBasic>
        </template>
      </NavigationBottom>
    </div>
  </div>
</article>
<teleport to="#modal">
  <Modal
    :open="!!editCollection"
    :hide-scroll="true"
    :use-shortcut="true"
    animation="bottom-up"
    @close="editCollection = undefined">
    <EditCollection
      :id="editCollection"
      @submit="onSubmitEditCollection"
      @close="editCollection = undefined"/>
  </Modal>
</teleport>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { authStore } from '../../store/index.js'
import { request } from '../../libs/api.js'
import { serialize } from '../../libs/strings.js'
import { dateFormat } from '../../libs/dates.js'
import { toast } from '../../modules/toast/index.js'
import AppError from '../../modules/AppError.js'
import PageHeader from '../../components/content/page-header.vue'
import ImageItem from '../../components/content/image/index.vue'
import Paginate from '../../components/navigation/paginate.vue'
import ShadowBox from '../../components/content/shadow-box.vue'
import NavigationBottom from '../../components/navigation/bottom.vue'
import ButtonBasic from '../../components/buttons/button-basic.vue'
import Icon from '../../components/icons/index.vue'
import LoadingScreen from '../../components/asset/loading/screen.vue'
import EmptyContent from '../../components/content/empty-content.vue'
import Dropdown from '../../components/navigation/dropdown.vue'
import Context from '../../components/navigation/context.vue'
import Modal from '../../components/modal/index.vue'
import EditCollection from './components/edit.vue'

const router = useRouter()
const route = useRoute()
const auth = authStore()
const display = reactive({
  size: 12,
  order: 'id',
  sort: 'desc',
})
const data = reactive({
  loading: true,
  page: route.query?.page ? Number(route.query.page) : 1,
  collection: undefined,
  assets: {
    loading: false,
    total: 0,
    index: [],
  },
})
const editCollection = ref(undefined)

const $collection = computed(() => {
  if (!data.collection) return null
  const { id, title, description, files, created_at } = data.collection
  return {
    id,
    title,
    description,
    regdate: dateFormat(new Date(created_at), '{yyyy}-{MM}-{dd}'),
    thumbnail: files?.coverCreate ? `/file/${files.coverCreate}/?_a=${auth.token}` : null,
  }
})
const $assets = computed(() => {
  return {
    total: data.assets.total,
    index: data.assets.index.map(item => {
      const { id, title, description, type, file_id, cover_file_id, created_at } = item
      let thumbnail = cover_file_id ? `/file/${cover_file_id}/?_a=${auth.token}` : undefined
      if (!thumbnail && /^image/.test(type))
      {
        thumbnail = file_id ? `/file/${file_id}/?w=480&h=320&q=75&t=cover&_a=${auth.token}` : undefined
      }
      return {
        id,
        title,
        description,
        thumbnail,
        regdate: dateFormat(new Date(created_at), '{yyyy}-{MM}-{dd}'),
      }
    }),
  }
})

onMounted(async () => {
  data.loading = true
  await Promise.all([
    fetchCollection(),
    fetchAssets(),
  ])
  data.loading = false
})
watch(() => route.query, async (value, _oldValue) => {
  const { page } = value
  data.page = page ? Number(page) : 1
  await fetchAssets()
})

async function fetchCollection()
{
  const id = Number(route.params.id)
  const res = await request(`/collection/${id}/`, {
    method: 'get',
  })
  if (!res?.data) throw new AppError('컬렉션 데이터가 없습니다.', 204)
  data.collection = res.data
}

async function fetchAssets()
{
  data.assets.loading = true
  const id = Number(route.params.id)
  const res = await request(`/collection/${id}/asset/`, {
    query: {
      page: data.page,
      size: display.size,
      order: display.order,
      sort: display.sort,
    },
  })
  if (res?.data)
  {
    data.assets.total = res.data.total
    data.assets.index = res.data.index
  }
  else
  {
    data.assets.total = 0
    data.assets.index = []
  }
  data.assets.loading = false
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

function onSelectCollectionContext({ key })
{
  switch (key)
  {
    case 'edit':
      editCollection.value = Number(route.params.id)
      break
    case 'remove':
      removeCollection().then()
      break
  }
}

function onSubmitEditCollection()
{
  editCollection.value = undefined
  fetchCollection().then()
}

async function removeCollection()
{
  if (!confirm('정말로 컬렉션을 삭제할까요? 삭제하면 다시 복구할 수 없습니다.')) return
  await request(`/collection/${route.params.id}/`, { method: 'delete' })
  toast.add('컬렉션을 삭제했습니다.', 'success').then()
  router.replace('/collection/').then()
}

async function removeAssetInCollection(id)
{
  try
  {
    if (!confirm('정말 이 컬렉션에서 에셋을 제거할까요?')) return
    const collectionId = Number(route.params.id)
    await request(`/collection/${collectionId}/asset/${id}/`, {
      method: 'delete',
    })
    toast.add('에셋을 제거했습니다.', 'success').then()
    await fetchAssets()
  }
  catch (e)
  {
    toast.add('에셋을 제거하지 못했습니다.', 'error').then()
  }
}
</script>

<style src="./detail.scss" lang="scss" scoped></style>
