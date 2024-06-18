<template>
<aside class="side-panel">
  <form
    @reset="onReset"
    @submit.prevent="onSubmit">
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
            @update:modelValue="emits('update:dateStart', $event)"/>
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
            @update:modelValue="emits('update:dateEnd', $event)"/>
        </dd>
      </dl>
    </div>
    <div class="field">
      <label for="file-type" class="label">종류</label>
      <div>
        <Select
          :model-value="props.fileType"
          id="file-type"
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
          @update:modelValue="emits('update:fileType', $event)"/>
      </div>
    </div>
    <div class="field">
      <label for="search-keyword" class="label">키워드</label>
      <div class="search-keyword">
        <FormGroup size="small">
          <InputText
            type="search"
            :model-value="props.q"
            id="search-keyword"
            placeholder="검색 키워드"
            size="small"
            @update:modelValue="emits('update:q', $event)"/>
        </FormGroup>
      </div>
    </div>
    <nav class="bottom-nav">
      <ButtonBasic type="submit" size="small" color="key-1">
        검색하기
      </ButtonBasic>
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

const props = defineProps({
  total: Number,
  dateStart: String,
  dateEnd: String,
  fileType: String,
  q: String,
})
const emits = defineEmits([
  'update:dateStart',
  'update:dateEnd',
  'update:fileType',
  'update:q',
  'submit',
])

function onReset()
{
  emits('update:dateStart', undefined)
  emits('update:dateEnd', undefined)
  emits('update:fileType', 'all')
  emits('update:q', '')
  emits('submit')
}

function onSubmit()
{
  emits('submit')
}
</script>

<style src="./filter.scss" lang="scss" scoped></style>
