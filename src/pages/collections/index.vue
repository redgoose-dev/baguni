<template>
<article class="collections">
  <PageHeader title="콜렉션">
    새로운 에셋을 만듭니다.
    <template #side>
      <Button
        color="key-1"
        left-icon="plus">
        콜렉션 만들기
      </Button>
    </template>
  </PageHeader>
  <div class="collections__body">
    <ul class="index">
      <li v-for="o in 8">
        <CollectionItem/>
      </li>
    </ul>
  </div>
</article>
</template>

<script setup>
import PageHeader from '../../components/content/page-header.vue'
import Button from '../../components/buttons/button-basic.vue'
import CollectionItem from '../../components/content/collection/index.vue'
</script>

<style src="./index.scss" lang="scss" scoped></style>
