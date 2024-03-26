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
      <RouterLink to="/asset/create">등록하기</RouterLink>
      <span>로그인</span>
      <span>회원정보 드롭다운</span>
    </nav>
  </div>
</header>
</template>

<script setup>

</script>

<style src="./header.scss" lang="scss" scoped></style>
