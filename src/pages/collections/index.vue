<template>
<article class="collections">
  <PageHeader title="컬렉션">
    에셋을 담아두는 컬렉션의 목록입니다.
    <template #side>
      <ButtonBasic
        href="/collection/create/"
        color="key-1"
        left-icon="plus">
        만들기
      </ButtonBasic>
    </template>
  </PageHeader>
  <div class="collections__body">
    <ul class="index">
      <li v-for="item in $index">
        <CollectionItem
          v-bind="item"
          @context="onSelectContextFromItem($event, item.id)"/>
      </li>
    </ul>
  </div>
</article>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { request, apiPath } from '../../libs/api.js'
import { dateFormat } from '../../libs/dates.js'
import PageHeader from '../../components/content/page-header.vue'
import ButtonBasic from '../../components/buttons/button-basic.vue'
import CollectionItem from '../../components/content/collection/index.vue'
import { toast } from "../../modules/toast/index.js";

const router = useRouter()
const route = useRoute()
const data = reactive({
  loading: true,
  total: 0,
  index: [],
})
const display = reactive({
  order: 'id',
  sort: 'desc',
})

const $index = computed(() => {
  if ( !(data.index?.length > 0) ) return []
  return data.index.map(item => {
    const { id, title, description, asset_count, regdate, cover_file_id } = item
    return {
      id,
      title,
      description,
      assetsCount: asset_count || 0,
      regdate: dateFormat(new Date(regdate), '{yyyy}-{MM}-{dd}'),
      thumbnail: cover_file_id ? `${apiPath}/file/${cover_file_id}/` : undefined,
    }
  })
})

onMounted(async () => {
  fetch().then()
})
watch(() => route.query, async (value, _oldValue) => {
  await fetch()
})

async function fetch()
{
  data.loading = true
  const res = await request(`/collections/`, {
    method: 'get',
    query: {
      // page: data.page,
      // size: display.size,
      order: display.order,
      sort: display.sort,
    },
  })
  const { total, index } = res.data
  data.total = total
  data.index = index
  data.loading = false
}

function onSelectContextFromItem(method, id)
{
  switch (method)
  {
    case 'edit':
      router.push(`/collection/${id}/edit/`).then()
      break
    case 'remove':
      removeCollection(id).then()
      break
  }
}

async function removeCollection(id)
{
  if (!confirm('정말로 컬렉션을 삭제할까요? 삭제하면 다시 복구할 수 없습니다.')) return
  await request(`${apiPath}/collection/${id}/`, { method: 'delete' })
  toast.add('컬렉션을 삭제했습니다.', 'success').then()
  await fetch()
}
</script>

<style src="./index.scss" lang="scss" scoped></style>
