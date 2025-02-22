<template>
<article class="page">
  <header class="page-header">
    <h1>
      <small>Content</small>
      <strong>Lightbox</strong>
    </h1>
    <p>이미지 전체화면으로 감상할 수 있는 컴포넌트</p>
  </header>
  <div class="page-content">
    <section class="page-section">
      <header>
        <h1>basic</h1>
        <p>기본적으로 사용하는 모습입니다.</p>
      </header>
      <div class="page-example">
        <figure class="images">
          <button
            v-for="image in images"
            type="button"
            @click="onClickImage(image)">
            <img :src="image" alt=""/>
          </button>
        </figure>
      </div>
    </section>
  </div>
</article>
<teleport to="#modal">
  <Lightbox
    :src="lightboxImage"
    @close="lightboxImage = ''"/>
</teleport>
</template>

<script setup>
import { ref } from 'vue'
import Lightbox from '../../../components/content/lightbox/index.vue'

const images = [
  'https://goose.redgoose.me/data/upload/original/202104/rg-20180616-000205.jpg',
  'https://goose.redgoose.me/data/upload/original/202005/cluster-no1_001.jpg',
  'https://goose.redgoose.me/data/upload/original/202106/rg-20181124-000291.jpg',
  'https://goose.redgoose.me/data/upload/original/201906/rg3121.jpg',
]
const lightboxImage = ref('')

function onClickImage(image)
{
  lightboxImage.value = image
}
</script>

<style lang="scss" scoped>
@use '../../../assets/scss/mixins';
@forward '../page';
.images {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin: 0;
  button {
    margin: 0;
    padding: 0;
    width: 100%;
    border: none;
    background: none;
    aspect-ratio: 6/4;
    overflow: clip;
    border-radius: 2px;
    cursor: pointer;
    &:active {
      opacity: .5;
    }
  }
  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}
</style>
