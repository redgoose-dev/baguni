<template>
<article class="select-tags">
  <PageHeader title="태그 선택하기">
    태그 목록에서 사용할 태그를 {{props.limit}}개까지 선택할 수 있습니다.
  </PageHeader>
  <FormGroup size="small" class="search-keyword">
    <template #left>
      <ButtonBasic type="text" color="weak" icon="search" size="small"/>
    </template>
    <InputText
      v-model="data.searchKeyword"
      type="search"
      size="small"
      placeholder="키워드를 입력해주세요."
      @update:model-value="onChangeSearchKeyword"/>
  </FormGroup>
  <div class="tags-index">
    <ul v-if="$index?.length > 0" class="index">
      <li v-for="tag in $index">
        <Tag
          :label="tag.name"
          :use-click="true"
          :color="tag.active ? 'key-3' : 'weak'"
          :fill="tag.active"
          @click="onClickTagFromIndex(tag)"/>
      </li>
    </ul>
    <p v-else class="empty">태그가 없습니다.</p>
  </div>
  <NavigationBottom class="nav-bottom">
    <template #center>
      <ButtonBasic @click="emits('close')">
        닫기
      </ButtonBasic>
      <ButtonBasic
        color="key-1"
        @click="onClickSubmit">
        선택완료
      </ButtonBasic>
    </template>
  </NavigationBottom>
  <ModalClose @click="emits('close')"/>
</article>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { pureObject } from '../../../libs/objects.js'
import { findObjectByValue } from '../../../libs/objects.js'
import { debounce } from '../../../libs/util.js'
import { request } from '../../../libs/api.js'
import { error } from '../../../libs/reactions.js'
import PageHeader from '../../../components/content/page-header.vue'
import ModalClose from '../../../components/modal/close.vue'
import NavigationBottom from '../../../components/navigation/bottom.vue'
import ButtonBasic from '../../../components/buttons/button-basic.vue'
import Tag from '../../../components/form/tag.vue'
import InputText from '../../../components/form/input-text.vue'
import FormGroup from '../../../components/form/group.vue'

const props = defineProps({
  tags: Array,
  limit: { type: Number, default: 1 },
})
const emits = defineEmits([ 'submit', 'close' ])
const loading = ref(true)
const data = reactive({
  index: [],
  selected: props.tags?.length > 0 ? props.tags.map(o => (o.id)) : [],
  searchKeyword: '',
  searchKeywordComplete: '',
})

const $index = computed(() => {
  let selected = []
  if (data.searchKeywordComplete)
  {
    selected = data.index.filter(tag => {
      if (data.selected.includes(tag.id)) return true
      return tag.name.toLowerCase().includes(data.searchKeywordComplete.toLowerCase())
    })
  }
  else
  {
    selected = data.index
  }
  return selected.map(o => {
    return {
      ...o,
      active: data.selected.includes(o.id),
    }
  })
})

onMounted(async () => {
  try
  {
    loading.value = true
    const res = await request('/tags/', {
      method: 'get',
    })
    if (res?.data?.index?.length > 0)
    {
      data.index = res.data.index.map(o => ({ id: o.id, name: o.name }))
    }
    else
    {
      data.index = []
    }
    loading.value = false
  }
  catch (e)
  {
    loading.value = false
    error('태그를 가져오는중에 오류가 발생했습니다.', e)
    emits('close')
  }
})

const onChangeSearchKeyword = debounce((text) => {
  data.searchKeywordComplete = data.searchKeyword
}, 400)

function onClickTagFromIndex(tag)
{
  const idx = data.selected.indexOf(tag.id)
  if (idx < 0)
  {
    if (data.selected.length + 1 > props.limit) return
    data.selected.push(tag.id)
  }
  else
  {
    data.selected.splice(idx, 1)
  }
}

function onClickSubmit()
{
  const result = data.selected.map(id => {
    return findObjectByValue(data.index, 'id', id)
  })
  emits('submit', pureObject(result))
}
</script>

<style src="./index.scss" lang="scss" scoped></style>
