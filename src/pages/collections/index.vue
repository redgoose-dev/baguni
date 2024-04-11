<template>
<article class="collections">
  <PageHeader title="콜렉션">
    새로운 에셋을 만듭니다.
    <template #side>
      <Button
        color="key-1"
        left-icon="plus"
        @click="onClickCreateCollection">
        만들기
      </Button>
    </template>
  </PageHeader>
  <div class="collections__body">
    <ul class="index">
      <li v-for="o in 8">
        <CollectionItem @context="onSelectContextFromItem"/>
      </li>
    </ul>
  </div>
</article>
<teleport to="#modal">
  <Modal
    :open="visibleCreateWindow"
    :hide-scroll="true"
    @close="visibleCreateWindow = false">
    <PostCollection
      @submit=""
      @close="visibleCreateWindow = false"/>
  </Modal>
</teleport>
</template>

<script setup>
import { ref } from 'vue'
import PageHeader from '../../components/content/page-header.vue'
import Button from '../../components/buttons/button-basic.vue'
import CollectionItem from '../../components/content/collection/index.vue'
import Modal from '../../components/modal/index.vue'
import PostCollection from './components/post.vue'

const visibleCreateWindow = ref(true)

function onSelectContextFromItem(method, key)
{
  console.log('onSelectContextFromItem()', method, key)
}

function onClickCreateCollection()
{
  visibleCreateWindow.value = true
}
</script>

<style src="./index.scss" lang="scss" scoped></style>
