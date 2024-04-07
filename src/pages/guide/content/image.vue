<template>
<article class="page">
  <header class="page-header">
    <h1>
      <small>Content</small>
      <strong>Image</strong>
    </h1>
    <p>이미지 카드 컴포넌트 사용법과 예시를 제공합니다.</p>
  </header>
  <div class="page-content">
    <section class="page-section">
      <header>
        <h1>list</h1>
        <p>목록으로 사용할때의 모습</p>
      </header>
      <div class="page-example">
        <div class="page-grid">
          <ImageItem
            v-for="o in 3"
            title="이미지 아이템 리스트 스타일"
            description="이미지 카드 설명"
            :meta="[ 'apple', 'banana', 'mango' ]"
            theme="list"/>
        </div>
      </div>
    </section>
    <section class="page-section">
      <header>
        <h1>thumbnail</h1>
        <p>썸네일 이미지로 부각할때의 모습</p>
      </header>
      <div class="page-example">
        <div class="page-grid" style="--column:3">
          <ImageItem
            v-for="o in 5"
            title="이미지 아이템 썸네일 스타일"
            description="이미지 카드 설명"
            :meta="[ 'apple', 'banana', 'mango' ]"
            theme="thumbnail"/>
        </div>
      </div>
    </section>
  </div>
</article>
</template>

<script setup>
import ImageItem from '../../../components/content/image/index.vue'
</script>

<style lang="scss" scoped>
@use '../../../assets/scss/mixins';
@import '../page';
</style>
