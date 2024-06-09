<template>
<article class="error full">
  <div class="error-content">
    <figure>
      <img src="../../assets/images/img-error@2x.webp" width="640" height="640" alt="" draggable="false"/>
    </figure>
    <h1>페이지가 없습니다!</h1>
    <code>Code: 404</code>
    <p>
      죄송합니다, 요청하신 페이지를 찾을 수 없습니다. 홈으로 돌아가거나 다른 링크를 시도해 주세요.
    </p>
    <nav>
      <div>
        <ButtonBasic href="/" color="key-1" right-icon="chevron-right" size="big">
          첫 페이지로 가기
        </ButtonBasic>
      </div>
    </nav>
  </div>
</article>
</template>

<script setup>
import ButtonBasic from "../../components/buttons/button-basic.vue";
</script>

<style src="./error.scss" lang="scss" scoped></style>
