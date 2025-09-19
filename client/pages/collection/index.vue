<template>
<article class="collections">
  <div class="collections__wrap">
    <PageHeader title="컬렉션">
      에셋을 담아두는 컬렉션의 목록입니다.
      <template #side>
        <ButtonBasic
          color="key-1"
          left-icon="plus"
          @click="createCollection = true">
          만들기
        </ButtonBasic>
      </template>
    </PageHeader>
    <div class="collections__body">
      <ul v-if="$index?.length > 0" class="index">
        <li v-for="item in $index">
          <ImageItem
            :to="`/collection/${item.id}/`"
            :image="item.image"
            :title="item.title"
            :meta="[ item.date ]"
            :nav="[]"
            theme="thumbnail">
            <template #body>
              <nav class="item-nav">
                <button type="button" @click="editCollection = item.id">
                  수정
                </button>
                <button type="button" @click="removeCollection(item.id)">
                  삭제
                </button>
              </nav>
            </template>
          </ImageItem>
        </li>
      </ul>
      <EmptyContent
        v-else
        message="컬렉션이 없습니다."
        class="collections__empty"/>
    </div>
  </div>
</article>
<teleport to="#modal">
  <Modal
    :open="createCollection"
    :hide-scroll="true"
    :use-shortcut="true"
    animation="bottom-up"
    @close="createCollection = false">
    <CreateCollection
      @submit="onSubmitCreateCollection"
      @close="createCollection = false"/>
  </Modal>
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
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { request } from '../../libs/api.js'
import { authStore } from '../../store/index.js'
import { dateFormat } from '../../libs/dates.js'
import { toast } from '../../modules/toast/index.js'
import PageHeader from '../../components/content/page-header.vue'
import ButtonBasic from '../../components/buttons/button-basic.vue'
import ImageItem from '../../components/content/image/index.vue'
import Modal from '../../components/modal/index.vue'
import CreateCollection from './components/create.vue'
import EditCollection from './components/edit.vue'
import EmptyContent from '../../components/content/empty-content.vue'

const router = useRouter()
const route = useRoute()
const auth = authStore()
const data = reactive({
  loading: true,
  total: 0,
  index: [],
})
const display = reactive({
  order: 'id',
  sort: 'asc',
})
const createCollection = ref(false)
const editCollection = ref(undefined)

const $index = computed(() => {
  if ( !(data.index?.length > 0) ) return []
  return data.index.map(item => {
    const { id, title, description, asset_count, created_at, cover_file_id } = item
    return {
      id,
      title,
      description,
      assetsCount: asset_count || 0,
      date: dateFormat(new Date(created_at), '{yyyy}-{MM}-{dd}'),
      image: cover_file_id ? `/file/${cover_file_id}/?_a=${auth.token}` : undefined,
    }
  })
})

onMounted(fetch)
watch(() => route.query, async (value, _oldValue) => fetch())

async function fetch()
{
  data.loading = true
  const res = await request(`/collection/`, {
    query: {
      order: display.order,
      sort: display.sort,
    },
  })
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

function onSubmitCreateCollection()
{
  createCollection.value = false
  fetch().then()
}

function onSubmitEditCollection()
{
  editCollection.value = undefined
  fetch().then()
}

async function removeCollection(id)
{
  if (!confirm('정말로 컬렉션을 삭제할까요? 삭제하면 다시 복구할 수 없습니다.')) return
  await request(`/collection/${id}/`, { method: 'delete' })
  toast.add('컬렉션을 삭제했습니다.', 'success').then()
  await fetch()
}
</script>

<style src="./index.scss" lang="scss" scoped></style>
