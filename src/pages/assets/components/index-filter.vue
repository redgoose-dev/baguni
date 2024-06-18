<template>
<form class="index-filter">
  <div class="column">
    <label for="order" class="label">정렬</label>
    <Select
      name="order"
      id="order"
      :model-value="props.order"
      :options="[
        { value: 'id', label: '아이디' },
        { value: 'title', label: '제목' },
        { value: 'regdate', label: '등록일' },
        { value: 'updated_at', label: '업데이트 날짜' },
      ]"
      placeholder=""
      size="small"
      class="order"
      @update:modelValue="emits('update:order', $event)"/>
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
      @update:modelValue="emits('update:sort', $event)"/>
  </div>
  <div class="column">
    <span class="label">테마</span>
    <RadioButton
      :model-value="props.theme"
      id="theme"
      name="theme"
      size="small"
      :only-icon="true"
      :options="[
        { value: 'list', label: '목록', icon: 'menu' },
        { value: 'thumbnail', label: '썸네일', icon: 'grid' },
      ]"
      @update:modelValue="emits('update:theme', $event)"/>
  </div>
</form>
</template>

<script setup>
import Select from '../../../components/form/select.vue'
import RadioButton from '../../../components/form/radio-button.vue'

const props = defineProps({
  order: { type: String, default: 'id' },
  sort: { type: String, default: 'desc' },
  theme: { type: String, default: 'thumbnail' },
})
const emits = defineEmits([
  'update:order',
  'update:sort',
  'update:theme',
])
</script>

<style src="./index-filter.scss" lang="scss" scoped></style>
