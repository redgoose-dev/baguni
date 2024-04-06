<template>
<div class="explorer">
  <div class="explorer__wrap">
    <PageHeader title="에셋 탐색하기">
      바구니에서 등록한 에셋을 찾아봅니다.
    </PageHeader>
    <div class="explorer__body">
      <div class="explorer__content">
        <IndexFilter @update="onUpdateIndexFilter"/>
        <ul :class="[
          'explorer__index',
          indexTheme === 'list' && 'list',
          indexTheme === 'thumbnail' && 'thumbnail',
        ]">
          <li v-for="o in 5">
            <ImageItem
              to="/asset/123"
              image="https://goose.redgoose.me/data/upload/original/202306/on-the-clouds-006.webp"
              title="많은 사용자분들의 사랑을 받고 있는 AI 드로잉"
              :meta="[ '0000-00-00' ]"
              :theme="indexTheme"
              class="item">
              <template #body>
                <nav class="item-nav">
                  <router-link to="/asset/edit/123">수정</router-link>
                  <a href="#">공유하기</a>
                  <a href="#">삭제하기</a>
                </nav>
              </template>
            </ImageItem>
          </li>
        </ul>
        <nav class="explorer__paginate">
          <Paginate
            v-model="page"
            :total="240"
            :size="8"
            :range="5"/>
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
import { ref } from 'vue'
import PageHeader from '../../components/content/page-header.vue'
import Filter from './components/filter.vue'
import IndexFilter from './components/index-filter.vue'
import Paginate from '../../components/navigation/paginate.vue'
import ImageItem from '../../components/content/image/index.vue'

const page = ref(12)
const indexTheme = ref('thumbnail') // list,thumbnail

function onUpdateIndexFilter(newValue)
{
  indexTheme.value = newValue.theme
}
</script>

<style src="./index.scss" lang="scss" scoped></style>
