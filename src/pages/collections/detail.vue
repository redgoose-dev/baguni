<template>
<article class="collection">
  <PageHeader title="컬렉션 에셋">
    컬렉션에 담겨있는 에셋의 목록입니다.
  </PageHeader>
  <div class="collection__body">
    <ShadowBox tag="article" class="info">
      <div class="info__body">
        <h2 class="info__title">컬렉션 제목</h2>
        <p class="info__description">
          뉴스 기사가 조회될 때마다 해당 뉴스 기사의 조회수를 증가시키는 쿼리를 실행합니다. 이는 클라이언트에서 뉴스를 조회할 때마다 서버 측에서 실행될 수 있습니다.
        </p>
        <p class="info__meta">
          <span>0000-00-00</span>
          <span>메타 항항목</span>
        </p>
      </div>
      <nav class="info__nav">
        <Dropdown v-model="openDropdownCollection" position="right">
          <template #trigger>
            <ButtonBasic
              size="small"
              right-icon="chevron-down"
              :color="openDropdownCollection ? 'weak' : ''">
              옵션
            </ButtonBasic>
          </template>
          <Context
            :items="[
              { label: '수정', icon: 'edit' },
              { label: '삭제', icon: 'trash-2', color: 'danger' },
            ]"
            @select=""/>
        </Dropdown>
      </nav>
    </ShadowBox>
    <div class="index-head">
      <p class="index-head__total">총 <strong>{{20}}</strong>개의 에셋이 있습니다.</p>
    </div>
    <ul class="index">
      <li v-for="o in 8">
        <ImageItem
          to="/asset/123"
          image="https://goose.redgoose.me/data/upload/original/202306/on-the-clouds-006.webp"
          title="많은 사용자분들의 사랑을 받고 있는 AI 드로잉"
          :meta="[ '0000-00-00' ]"
          theme="thumbnail"
          class="item">
          <template #body>
            <nav class="item-nav">
              <router-link to="/asset/edit/123">수정</router-link>
              <a href="#">공유하기</a>
            </nav>
          </template>
        </ImageItem>
      </li>
    </ul>
    <div class="collection__paginate">
      <Paginate
        v-model="page"
        :total="200"
        :size="20"
        :range="5"/>
    </div>
    <NavigationBottom class="bottom">
      <template #left>
        <ButtonBasic href="/collections" size="big">컬렉션 목록</ButtonBasic>
      </template>
    </NavigationBottom>
  </div>
</article>
</template>

<script setup>
import { ref } from 'vue'
import PageHeader from '../../components/content/page-header.vue'
import ImageItem from '../../components/content/image/index.vue'
import Paginate from '../../components/navigation/paginate.vue'
import ShadowBox from '../../components/content/shadow-box.vue'
import Dropdown from '../../components/navigation/dropdown.vue'
import Context from '../../components/navigation/context.vue'
import NavigationBottom from '../../components/navigation/bottom.vue'
import ButtonBasic from '../../components/buttons/button-basic.vue'

const openDropdownCollection = ref(false)
const page = ref(1)
</script>

<style src="./detail.scss" lang="scss" scoped></style>
