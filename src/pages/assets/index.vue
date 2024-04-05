<template>
<div class="explorer">
  <div class="explorer__wrap">
    <PageHeader title="에셋 탐색하기">
      바구니에서 등록한 에셋을 찾아봅니다.
    </PageHeader>
    <div class="explorer__body">
      <div class="explorer__content">
        <IndexFilter/>
        <ul class="explorer__index">
          <li v-for="o in 20">
            <ImageThumbnail
              to="/asset/123"
              image="https://goose.redgoose.me/data/upload/original/202306/on-the-clouds-006.webp"
              title="많은 사용자분들의 사랑을 받고 있는 AI 드로잉"
              :meta="[ '0000-00-00' ]"
              :nav="[
                { key: 'edit', label: '수정', icon: 'edit' },
                { key: 'remove', label: '삭제', icon: 'trash-2', color: 'danger' },
              ]"/>
          </li>
        </ul>
        <nav class="explorer__paginate">
          <Paginate/>
        </nav>
      </div>
      <div class="explorer__filter">
        <Filter/>
      </div>
    </div>
  </div>
</div>
</template>

<script setup>
import PageHeader from '../../components/content/page-header.vue'
import Filter from './components/filter.vue'
import IndexFilter from './components/index-filter.vue'
import Paginate from '../../components/navigation/paginate.vue'
import { ImageList, ImageThumbnail } from '../../components/content/image'
</script>

<style src="./index.scss" lang="scss" scoped></style>
