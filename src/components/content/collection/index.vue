<template>
<div class="collection-item">
  <figure class="collection-item__cover">
    <router-link to="/collection/123">
      <img src="https://goose.redgoose.me/data/upload/original/202101/rg-20180526-000161.jpg" alt=""/>
    </router-link>
  </figure>
  <div class="collection-item__body">
    <h2 class="title">
      <router-link to="/collection/123">사람에 대한 모음</router-link>
    </h2>
    <p class="description">
      뉴스 기사가 조회될 때마다 해당 뉴스 기사의 조회수를 증가시키는 쿼리를 실행합니다. 이는 클라이언트에서 뉴스를 조회할 때마다 서버 측에서 실행될 수 있습니다.
    </p>
    <p class="meta">
      <span>총 123개의 에셋</span>
      <span>0000-00-00</span>
      <span>메타 항목목</span>
    </p>
  </div>
  <nav class="collection-item__side">
    <Dropdown
      :use-value="true"
      position="right">
      <Context
        :items="[
          { key: 'edit', label: '수정', icon: 'edit' },
          { key: 'remove', label: '삭제', icon: 'trash-2', color: 'danger' },
        ]"
        @select=""/>
    </Dropdown>
  </nav>
</div>
</template>

<script setup>
import Dropdown from '../../navigation/dropdown.vue'
import Context from '../../navigation/context.vue'
</script>

<style src="./index.scss" lang="scss" scoped></style>
