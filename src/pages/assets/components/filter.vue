<template>
<aside class="side-panel">
  <form @submit.prevent="onUpdateTrigger('q')" @reset="onReset">
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
            :model-value="props.dateStart"
            id="dateStart"
            placeholder="YYYY-MM-DD"
            size="small"
            @update:modelValue="onUpdateTrigger('dateStart', $event)"/>
        </dd>
        <dt>
          <label for="dateEnd">종료</label>
        </dt>
        <dd>
          <InputText
            type="date"
            :model-value="props.dateEnd"
            id="dateEnd"
            placeholder="YYYY-MM-DD"
            size="small"
            @update:modelValue="onUpdateTrigger('dateEnd', $event)"/>
        </dd>
      </dl>
    </div>
    <div class="field">
      <label for="file-type" class="label">종류</label>
      <div>
        <Select
          id="file-type"
          :model-value="props.fileType"
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
          @update:modelValue="onUpdateTrigger('fileType', $event)"/>
      </div>
    </div>
    <div class="field">
      <label for="order" class="label">정렬</label>
      <div class="order-sort">
        <Select
          name="order"
          id="order"
          :model-value="props.order"
          :options="[
            { value: 'id', label: '아이디' },
            { value: 'title', label: '제목' },
            { value: 'regdate', label: '등록일' },
            { value: 'updated_at', label: '업데이트' },
          ]"
          placeholder=""
          size="small"
          class="order"
          @update:modelValue="onUpdateTrigger('order', $event)"/>
        <Select
          name="sort"
          :model-value="props.sort"
          placeholder=""
          size="small"
          :options="[
            { value: 'asc', label: 'A to Z' },
            { value: 'desc', label: 'Z to A' },
          ]"
          class="sort"
          @update:modelValue="onUpdateTrigger('sort', $event)"/>
      </div>
    </div>
    <div class="field">
      <label for="theme" class="label">테마</label>
      <div>
        <RadioButton
          id="theme"
          name="theme"
          :model-value="props.indexTheme"
          size="small"
          :only-icon="true"
          :options="[
            { value: 'list', label: '목록', icon: 'menu' },
            { value: 'thumbnail', label: '썸네일', icon: 'grid' },
          ]"
          @update:modelValue="onUpdateTrigger('indexTheme', $event)"/>
      </div>
    </div>
    <div class="field">
      <label for="tag" class="label">태그</label>
      <div>
        TODO: 태그
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
      <ButtonBasic type="reset" size="small" color="weak">
        재설정
      </ButtonBasic>
    </nav>
  </form>
</aside>
</template>

<script setup>
import ButtonBasic from '../../../components/buttons/button-basic.vue'
import InputText from '../../../components/form/input-text.vue'
import Select from '../../../components/form/select.vue'
import FormGroup from '../../../components/form/group.vue'
import RadioButton from '../../../components/form/radio-button.vue'

const keys = [
  'dateStart',
  'dateEnd',
  'fileType',
  'order',
  'sort',
  'indexTheme',
  'tags',
  'q',
]
const props = defineProps({
  total: Number,
  dateStart: String,
  dateEnd: String,
  fileType: String,
  order: String,
  sort: String,
  indexTheme: String,
  tags: Array,
  q: String,
})
const emits = defineEmits([
  'update:dateStart',
  'update:dateEnd',
  'update:fileType',
  'update:order',
  'update:sort',
  'update:indexTheme',
  'update:q',
  'submit',
  'reset',
])

function onReset()
{
  emits('reset')
}

function onUpdateTrigger(key, value)
{
  if (!keys.includes(key)) return
  switch (key)
  {
    case 'indexTheme':
      emits(`update:${key}`, value)
      break
    case 'q':
      emits('submit')
      break
    default:
      emits(`update:${key}`, value)
      emits('submit')
      break
  }
}
</script>

<style src="./filter.scss" lang="scss" scoped></style>
