<template>
<aside class="side-panel">
  <form @submit.prevent="onSubmit">
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
      <label for="file-type" class="label">종류</label>
      <div>
        <Select
          id="file-type"
          v-model="assets.filter.fileType"
          title="에셋의 종류"
          size="small"
          placeholder=""
          :options="[
            { value: 'all', label: '모두' },
            { value: 'image', label: '이미지' },
            { value: 'document', label: '문서' },
            { value: 'audio', label: '음악' },
            { value: 'video', label: '동영상' },
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
          :only-icon="true"
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
            <Tag :label="tag"/>
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
              :model-value="props.q"
              id="search-keyword"
              placeholder="검색 키워드"
              size="small"
              @update:modelValue="$emit('update:q', $event)"/>
          </template>
          <template #right>
            <ButtonBasic
              type="submit"
              icon="search"
              size="small"
              color="key-1"
              class="search-keyword__submit"/>
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
      <SelectTags
        :tags="assets.filter.tags"
        :limit="3"
        @submit="onSubmitSelectTags"
        @close="openSelectTags = false"/>
    </Modal>
  </teleport>
</aside>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { assetStore } from '../../../store/assets.js'
import ButtonBasic from '../../../components/buttons/button-basic.vue'
import InputText from '../../../components/form/input-text.vue'
import Select from '../../../components/form/select.vue'
import FormGroup from '../../../components/form/group.vue'
import RadioButton from '../../../components/form/radio-button.vue'
import Tag from '../../../components/form/tag.vue'
import Modal from '../../../components/modal/index.vue'
import SelectTags from './select-tags.vue'

const assets = assetStore()
const props = defineProps({
  total: Number,
  q: String,
})
const emits = defineEmits([
  'update:q',
  'submit',
  'reset',
])
const openSelectTags = ref(false)

function onReset()
{
  assets.resetFilter()
  emits('submit')
}

function onUpdateTrigger(obj)
{
  if (obj) assets.saveFilter()
  emits('submit')
}

function onSubmit()
{
  emits('submit')
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
  onSubmit()
}
</script>

<style src="./filter.scss" lang="scss" scoped></style>
