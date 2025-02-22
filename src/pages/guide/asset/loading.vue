<template>
<article class="page">
  <header class="page-header">
    <h1>
      <small>Asset</small>
      <strong>Loading</strong>
    </h1>
    <p>로딩상태에서 사용하는 컴포넌트</p>
  </header>
  <div class="page-content">
    <section class="page-section">
      <header>
        <h1>basic</h1>
        <p>기본적으로 사용하는 모습입니다.</p>
      </header>
      <div class="page-example page-grid" style="height:200px;--p-content:center">
        <Loading class="loader"/>
      </div>
    </section>
    <section class="page-section">
      <header>
        <h1>move animation</h1>
        <p>옆으로 이동하는 애니메이션</p>
      </header>
      <div class="page-example page-grid" style="height:200px;--p-content:center">
        <div class="loader-move">
          <Loading/>
        </div>
      </div>
    </section>
  </div>
</article>
</template>

<script setup>
import Loading from '../../../components/asset/loading/index.vue'
</script>

<style lang="scss" scoped>
@use '../../../assets/scss/mixins';
@forward '../page';
.loader-move {
  width: 400px;
  .loader {
    animation: move-loader 4000ms linear infinite;
    --loader-animation-speed: 600ms;
  }
}
@keyframes move-loader {
  0% {
    translate: 0 0;
  }
  100% {
    translate: calc(400px - 48px) 0;
  }
}
</style>
