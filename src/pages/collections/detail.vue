<template>
<article class="collection">
  <PageHeader title="콜렉션 에셋">
    콜렉션에 담겨있는 에셋의 목록입니다.
  </PageHeader>
  <div class="collection__body">
    <ul class="index">
      <li>.item</li>
      <li>.item</li>
      <li>.item</li>
    </ul>
    <Paginate
      v-model="page"
      :total="200"
      :size="20"
      :range="5"/>
  </div>
</article>
</template>

<script setup>
import { ref } from 'vue'
import PageHeader from '../../components/content/page-header.vue'
import Paginate from '../../components/navigation/paginate.vue'

const page = ref(1)
</script>

<style src="./detail.scss" lang="scss" scoped></style>
