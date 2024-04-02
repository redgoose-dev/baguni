<template>
<div class="explorer">
  <div class="explorer__wrap">
    <PageHeader title="에셋 탐색하기">
      바구니에서 등록한 에셋을 찾아봅니다.
    </PageHeader>
    <div class="explorer__body">
      <div class="explorer__content">
        <IndexFilter/>
        <div class="explorer__index">
          // TODO: index
          <ul>
            <li>item</li>
          </ul>
        </div>
        <nav>
          // TODO: paginate
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
</script>

<style src="./index.scss" lang="scss" scoped></style>
