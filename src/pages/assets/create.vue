<template>
<article class="create-asset">
  <PageHeader title="에셋 만들기">
    새로운 에셋을 만듭니다.
  </PageHeader>
  <Post mode="create"/>
</article>
</template>

<script setup>
import PageHeader from '../../components/content/page-header.vue'
import Post from './components/post.vue'
</script>

<style lang="scss" scoped>
.create-asset {
  margin: 0 auto;
  max-width: var(--size-content-width);
}
</style>
