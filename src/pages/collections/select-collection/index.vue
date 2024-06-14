<template>
<article class="collections">
  <ModalHeader title="컬렉션/에셋 편집">
    <template #description>컬렉션에 담을 에셋을 선택하세요.</template>
    <template #side>
      <ModalButtonClose @click="emits('close')"/>
    </template>
  </ModalHeader>
  <div v-if="data.loading" class="index-loading">
    <Loading/>
  </div>
  <div v-else-if="$index?.length > 0" class="index">
    <ul>
      <li v-for="item in $index">
        <Item v-bind="item" @check="onCheckItem"/>
      </li>
    </ul>
  </div>
  <div v-else class="empty">
    .empty
  </div>
  <NavigationBottom class="bottom">
    <template #left>
      <ButtonBasic
        left-icon="plus"
        @click="create.open = true">
        새로운 컬렉션
      </ButtonBasic>
    </template>
    <template #right>
      <ButtonBasic
        color="key-1"
        :left-icon="processing ? 'loader' : 'check'"
        :rotate-icon="processing"
        @click="onSubmit">
        {{processing ? '처리중..' : '완료'}}
      </ButtonBasic>
    </template>
  </NavigationBottom>
</article>
<teleport to="#modal">
  <Modal
    :open="create.open"
    :hide-scroll="true"
    @close="create.open = false">
    <PostCollection
      :data="null"/>
  </Modal>
</teleport>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { request, apiPath, formData } from '../../../libs/api.js'
import { pureObject } from '../../../libs/objects.js'
import { toast } from '../../../modules/toast/index.js'
import Modal from '../../../components/modal/index.vue'
import ModalHeader from '../../../components/modal/header.vue'
import ModalButtonClose from '../../../components/modal/button-close.vue'
import ButtonBasic from '../../../components/buttons/button-basic.vue'
import PostCollection from '../components/post.vue'
import NavigationBottom from '../../../components/navigation/bottom.vue'
import Loading from '../../../components/asset/loading/index.vue'
import Item from './item.vue'

const props = defineProps({
  assetId: Number,
  selectedCollections: Array,
})
const emits = defineEmits([ 'submit', 'close' ])
const ids = ref([])
const data = reactive({
  loading: true,
  index: [],
})
const create = reactive({
  open: false,
})
const processing = ref(false)

const $index = computed(() => {
  return data.index.map(o => {
    return {
      id: o.id,
      title: o.title,
      description: o.description,
      thumbnail: `${apiPath}/file/${o.cover_file_id}`,
      active: ids.value.includes(o.id),
    }
  })
})

onMounted(async () => {
  try
  {
    data.loading = true
    ids.value = pureObject(props.selectedCollections)
    let res = await request('/collections/', {
      method: 'get',
    })
    data.index = res.data?.index?.length > 0 ? res.data.index : []
    data.loading = false
  }
  catch (e)
  {
    console.error(e)
    data.index = []
    data.loading = false
  }
})

function onCheckItem(id)
{
  if (ids.value.includes(id))
  {
    let idx = ids.value.indexOf(id)
    if (idx !== -1) ids.value.splice(idx, 1)
  }
  else
  {
    ids.value.push(id)
  }
}

async function onSubmit()
{
  try
  {
    processing.value = true
    await request(`/asset/${props.assetId}/collections/`, {
      method: 'put',
      body: { collections: ids.value.join(',') },
    })
    processing.value = false
    emits('submit', pureObject(ids.value))
    toast.add('컬렉션/에셋 편집을 완료했습니다.', 'success')
  }
  catch (e)
  {
    processing.value = false
    toast.add('컬렉션/에셋 편집을 하지 못했습니다.', 'error')
  }
}
</script>

<style src="./index.scss" lang="scss" scoped></style>
