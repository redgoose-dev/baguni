<template>
<article class="page">
  <header class="page-header">
    <h1>
      <small>Guide</small>
      <strong>Development guide</strong>
    </h1>
    <p>바구니 앱에서 사용되는 요소들 가이드</p>
  </header>
  <div class="page-content">
    <div class="content-body">
      <p>이 컨텐츠는 바구니를 만들면서 사용해왔던 공통 컴포넌트들을 편하게 확인하면서 활용할 수 있도록 도움을 주는 영역이라고 할 수 있습이다.</p>
    </div>
  </div>
</article>
</template>

<script setup>
</script>

<style lang="scss" scoped>
@use '../../assets/scss/mixins';
@forward './page';
.content-body {
  font-size: 14px;
  line-height: 1.42;
  > p {
    &:first-child {
      margin-top: 0;
    }
    &:last-child {
      margin-bottom: 0;
    }
  }
}
</style>
