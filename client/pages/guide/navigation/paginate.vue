<template>
<article class="page">
  <header class="page-header">
    <h1>
      <small>Navigation</small>
      <strong>Paginate</strong>
    </h1>
    <p>목록 페이지 네비게이션 예제입니다.</p>
  </header>
  <div class="page-content">
    <section class="page-section">
      <header>
        <h1>basic</h1>
        <p>기본적으로 사용하는 모습입니다.</p>
      </header>
      <div class="page-example">
        <Paginate
          v-model="pageBasic"
          :total="1000"
          :size="20"
          :range="8"/>
        <pre class="page-example-result">page: {{pageBasic}}</pre>
      </div>
    </section>
  </div>
</article>
</template>

<script setup>
import { ref } from 'vue'
import Paginate from '../../../components/navigation/paginate.vue'

const pageBasic = ref(1)
</script>

<style lang="scss" scoped>
@forward '../page';
</style>
