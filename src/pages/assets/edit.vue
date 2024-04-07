<template>
<article class="edit-asset">
  <PageHeader title="에셋 수정하기">
    에셋을 데이터를 수정합니다.
  </PageHeader>
  <Post mode="edit"/>
</article>
</template>

<script setup>
import PageHeader from '../../components/content/page-header.vue'
import Post from './components/post.vue'
</script>

<style lang="scss" scoped>
.edit-asset {
  margin: 0 auto;
  max-width: var(--size-content-width);
}
</style>
