<template>
<aside class="side-panel">
  <form @submit.prevent>
    <div class="field total">
      <h3>모두</h3>
      <strong>{{props.total}}</strong>
    </div>
    <div class="field">
      <span class="label">등록일 범위</span>
      <dl class="date-range">
        <dt>
          <label for="dateStart">시작</label>
        </dt>
        <dd>
          <InputText
            type="date"
            v-model="assets.filter.dateStart"
            id="dateStart"
            placeholder="YYYY-MM-DD"
            size="small"
            @update:modelValue="onUpdateTrigger({ dateStart: $event })"/>
        </dd>
        <dt>
          <label for="dateEnd">종료</label>
        </dt>
        <dd>
          <InputText
            type="date"
            v-model="assets.filter.dateEnd"
            id="dateEnd"
            placeholder="YYYY-MM-DD"
            size="small"
            @update:modelValue="onUpdateTrigger({ dateEnd: $event })"/>
        </dd>
      </dl>
    </div>
    <div class="field">
      <label for="file-type" class="label">파일타입</label>
      <div>
        <Select
          id="file-type"
          v-model="assets.filter.fileType"
          title="에셋의 종류"
          size="small"
          placeholder=""
          :options="[
            { value: 'all', label: '모두' },
            ...(Object.entries(fileTypes).map(([ value, label ]) => {
              return { value, label }
            })),
          ]"
          @update:modelValue="onUpdateTrigger({ fileType: $event })"/>
      </div>
    </div>
    <div class="field">
      <label for="order" class="label">정렬</label>
      <div class="order-sort">
        <Select
          name="order"
          id="order"
          v-model="assets.filter.order"
          :options="[
            { value: 'id', label: '아이디' },
            { value: 'title', label: '제목' },
            { value: 'regdate', label: '등록일' },
            { value: 'updated_at', label: '업데이트' },
          ]"
          placeholder=""
          size="small"
          class="order"
          @update:modelValue="onUpdateTrigger({ order: $event })"/>
        <Select
          name="sort"
          v-model="assets.filter.sort"
          placeholder=""
          size="small"
          :options="[
            { value: 'asc', label: 'A to Z' },
            { value: 'desc', label: 'Z to A' },
          ]"
          class="sort"
          @update:modelValue="onUpdateTrigger({ sort: $event })"/>
      </div>
    </div>
    <div class="field">
      <span class="label">테마</span>
      <div>
        <RadioButton
          name="theme"
          v-model="assets.filter.indexTheme"
          size="small"
          :only-icon="false"
          :options="[
            { value: 'list', label: '목록', icon: 'menu' },
            { value: 'thumbnail', label: '썸네일', icon: 'grid' },
          ]"
          @update:modelValue="assets.saveFilter()"/>
      </div>
    </div>
    <div class="field">
      <span class="label">태그</span>
      <div class="tags">
        <ul v-if="assets.filter.tags?.length > 0">
          <li v-for="tag in assets.filter.tags">
            <Tag
              :label="tag.name"
              :use-remove="true"
              :fill="false"
              color="weak"
              @remove="onRemoveTag(tag.id)"/>
          </li>
        </ul>
        <nav>
          <ButtonBasic
            size="small"
            color="key-1"
            left-icon="tag"
            @click="onClickSelectTag">
            태그 선택하기
          </ButtonBasic>
        </nav>
      </div>
    </div>
    <div class="field">
      <label for="search-keyword" class="label">키워드</label>
      <div class="search-keyword">
        <FormGroup size="small">
          <template #left>
            <InputText
              type="search"
              v-model="fields.q"
              id="search-keyword"
              placeholder="검색 키워드"
              size="small"
              @submit="onClickSearchKeyword"/>
          </template>
          <template #right>
            <ButtonBasic
              type="submit"
              icon="search"
              size="small"
              color="key-1"
              class="search-keyword__submit"
              @click="onClickSearchKeyword"/>
          </template>
        </FormGroup>
      </div>
    </div>
    <nav class="bottom-nav">
      <ButtonBasic
        size="small"
        color="weak"
        @click="onReset">
        재설정
      </ButtonBasic>
    </nav>
  </form>
  <teleport to="#modal">
    <Modal
      :open="openSelectTags"
      :hide-scroll="true"
      :use-shortcut="true"
      animation="bottom-up"
      @close="openSelectTags = false">
      <TagSelector
        :tags="assets.filter.tags"
        :limit="5"
        @submit="onSubmitSelectTags"
        @close="openSelectTags = false"/>
    </Modal>
  </teleport>
</aside>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { authStore } from '../../../store/auth.js'
import { assetStore } from '../../../store/assets.js'
import { findObjectByKey } from '../../../libs/objects.js'
import ButtonBasic from '../../../components/buttons/button-basic.vue'
import InputText from '../../../components/form/input-text.vue'
import Select from '../../../components/form/select.vue'
import FormGroup from '../../../components/form/group.vue'
import RadioButton from '../../../components/form/radio-button.vue'
import Tag from '../../../components/form/tag.vue'
import Modal from '../../../components/modal/index.vue'
import TagSelector from '../../../components/content/tag-selector/index.vue'

const auth = authStore()
const assets = assetStore()
const props = defineProps({
  total: Number,
  q: String,
})
const emits = defineEmits([ 'update', 'update-keyword', 'reset' ])
const fields = reactive({
  q: props.q,
})
const openSelectTags = ref(false)
const fileTypes = ref(auth.user?.json?.asset?.file_types || { image: '이미지' })

defineExpose({
  updateSearchKeyword: (q) => { fields.q = q },
})

function onReset()
{
  fields.q = ''
  assets.resetFilter()
  emits('reset')
}

function onUpdateTrigger(obj)
{
  if (obj) assets.saveFilter()
  emits('update')
}

function onClickSelectTag()
{
  openSelectTags.value = true
}
function onSubmitSelectTags(tags)
{
  assets.filter.tags = tags
  assets.saveFilter()
  openSelectTags.value = false
  emits('update')
}
function onRemoveTag(id)
{
  const idx = findObjectByKey(assets.filter.tags, 'id', id)
  assets.filter.tags.splice(idx, 1)
  assets.saveFilter()
  emits('update')
}

function onClickSearchKeyword()
{
  emits('update-keyword', fields.q)
}
</script>

<style src="./filter.scss" lang="scss" scoped></style>
