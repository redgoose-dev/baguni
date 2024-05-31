<template>
<article class="collections">
  <ModalHeader title="컬렉션 선택하기">
    <template #description>에셋을 추가할 컬렉션을 선택하세요.</template>
  </ModalHeader>
</article>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import ModalHeader from '../../../components/modal/header.vue'
</script>

<style src="./select-collection.scss" lang="scss" scoped></style>
