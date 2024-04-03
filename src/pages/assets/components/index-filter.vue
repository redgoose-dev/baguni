<template>
<form class="index-filter">
  <div class="column">
    <label for="">정렬</label>
    <Select
      :options="[
        { label: '이름', value: 'name' },
        { label: '조회순', value: 'hit' },
      ]"
      placeholder="정렬"
      size="small"/>
  </div>
  <div class="column">
    <RadioButton
      name="index-theme"
      size="small"
      :only-icon="true"
      :options="[
        { value: 'list', label: '목록', icon: 'menu' },
        { value: 'thumbnail', label: '썸네일', icon: 'grid' },
      ]"/>
  </div>
</form>
</template>

<script setup>
import Select from '../../../components/form/select.vue'
import RadioButton from '../../../components/form/radio-button.vue'
</script>

<style src="./index-filter.scss" lang="scss" scoped></style>
