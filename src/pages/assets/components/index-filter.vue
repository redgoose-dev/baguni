<template>
<form class="index-filter">
  <div class="column">
    <label for="sort">정렬</label>
    <Select
      id="sort"
      v-model="filterValue.sort"
      :options="[
        { label: '이름', value: 'name' },
        { label: '조회순', value: 'hit' },
      ]"
      placeholder="정렬"
      size="small"
      @update:modelValue="onUpdated"/>
  </div>
  <div class="column">
    <RadioButton
      v-model="filterValue.theme"
      name="index-theme"
      size="small"
      :only-icon="true"
      :options="[
        { value: 'list', label: '목록', icon: 'menu' },
        { value: 'thumbnail', label: '썸네일', icon: 'grid' },
      ]"
      @update:modelValue="onUpdated"/>
  </div>
</form>
</template>

<script setup>
import { reactive } from 'vue'
import { pureObject } from '../../../libs/objects'
import Select from '../../../components/form/select.vue'
import RadioButton from '../../../components/form/radio-button.vue'

const emits = defineEmits([ 'update' ])
const filterValue = reactive({
  sort: '',
  theme: 'thumbnail',
})

function onUpdated()
{
  emits('update', pureObject(filterValue))
}
</script>

<style src="./index-filter.scss" lang="scss" scoped></style>
