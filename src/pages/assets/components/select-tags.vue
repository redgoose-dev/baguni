<template>
<article class="select-tags">
  <PageHeader title="태그 선택하기">
    태그 목록에서 사용할 태그를 {{props.limit}}개까지 선택할 수 있습니다.
  </PageHeader>
  <div class="tags-index">
    <ul class="index" v-if="$index?.length > 0">
      <li v-for="tag in $index">
        <Tag
          :label="tag"
          :use-click="true"
          :color="data.selected.includes(tag) ? 'key-3' : 'weak'"
          :fill="data.selected.includes(tag)"
          @click="onClickTagFromIndex(tag)"/>
      </li>
    </ul>
    <p v-else class="empty">태그가 없습니다.</p>
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
  </div>
  <article class="selected-tags">
    <h1>선택한 태그</h1>
    <ul>
      <li v-if="data.selected?.length > 0" v-for="tag in data.selected">
        <Tag
          :label="tag"
          :use-remove="true"
          color="key-3"
          :fill="true"
          @remove="onClickRemoveSelected(tag)"/>
      </li>
      <li v-else class="empty">태그가 없습니다.</li>
    </ul>
  </article>
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
  index: [ 'aaaa', 'bbb', 'ccc', 'abc', 'ddd', 'eee', 'fffff' ],
  selected: props.tags?.length > 0 ? props.tags : [],
  searchKeyword: '',
  searchKeywordComplete: '',
})

const $index = computed(() => {
  if (data.searchKeywordComplete)
  {
    return data.index.filter(tag => {
      return tag.toLowerCase().includes(data.searchKeywordComplete.toLowerCase())
    })
  }
  else
  {
    return data.index
  }
})

onMounted(async () => {
  try
  {
    loading.value = true
    const res = await request('/tags/', {
      method: 'get',
    })
    data.index = res.data?.index?.length > 0 ? res.data?.index.map(o => (o.name)) : []
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
  const idx = data.selected.indexOf(tag)
  if (idx < 0)
  {
    if (data.selected.length + 1 > props.limit) return
    data.selected.push(tag)
  }
  else
  {
    data.selected.splice(idx, 1)
  }
}

function onClickRemoveSelected(tag)
{
  const idx = data.selected.indexOf(tag)
  data.selected.splice(idx, 1)
}

function onClickSubmit()
{
  emits('submit', pureObject(data.selected))
}
</script>

<style src="./select-tags.scss" lang="scss" scoped></style>
