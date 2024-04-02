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
    // TODO: 목록테마(라디오 탭 스타일 컴포넌트)
  </div>
</form>
</template>

<script setup>
import Select from '../../../components/form/select.vue'
</script>

<style src="./index-filter.scss" lang="scss" scoped></style>
