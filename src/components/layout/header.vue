<template>
<header class="layout-header">
  <div class="layout-header__wrap">
    <h1 class="symbol">
      <RouterLink to="/">
        <img src="../../assets/images/symbol.svg" alt="바구니">
      </RouterLink>
    </h1>
    <nav class="menus">
      <ul>
        <li>
          <RouterLink to="/">탐색</RouterLink>
        </li>
        <li>
          <RouterLink to="/collections">콜렉션</RouterLink>
        </li>
        <li>
          <RouterLink to="/about">소개</RouterLink>
        </li>
        <li>
          <RouterLink to="/guide">개발 가이드</RouterLink>
        </li>
      </ul>
    </nav>
    <nav class="side-nav">
      <template v-if="isLogin">
        <div>
          <ButtonBasic
            href="/asset/create"
            size="small"
            color="key-1">
            등록하기
          </ButtonBasic>
        </div>
        <div>
          <ButtonBasic
            size="small"
            right-icon="chevron-down">
            foo@bar.com
          </ButtonBasic>
        </div>
      </template>
      <template v-else>
        <div>
          <ButtonBasic
            href="/asset/create"
            size="small"
            color="key-1">
            로그인
          </ButtonBasic>
        </div>
      </template>
    </nav>
  </div>
</header>
</template>

<script setup>
import { ref } from 'vue'
import ButtonBasic from '../buttons/button-basic.vue'

const isLogin = ref(true)
</script>

<style src="./header.scss" lang="scss" scoped></style>
