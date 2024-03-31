<template>
<article class="page">
  <header class="page-header">
    <h1>
      <small>Forms</small>
      <strong>Tag</strong>
    </h1>
    <p>키워드 태그 컴포넌트 사용법과 예시를 제공합니다.</p>
  </header>
  <div class="page-content">
    <section class="page-section">
      <header>
        <h1>basic</h1>
        <p>기본적으로 사용하는 모습입니다.</p>
      </header>
      <div class="page-example">
        <div class="page-flex" style="--gap:8px">
          <Tag label="사과"/>
          <Tag label="바나나"/>
          <Tag label="망고"/>
        </div>
      </div>
    </section>
    <section class="page-section">
      <header>
        <h1>color</h1>
        <p>태그의 컬러</p>
      </header>
      <div class="page-example">
        <div class="page-flex" style="--gap:8px">
          <Tag label="default"/>
          <Tag label="key-1" color="key-1"/>
          <Tag label="key-2" color="key-2"/>
          <Tag label="key-3" color="key-3"/>
          <Tag label="success" color="success"/>
          <Tag label="danger" color="danger"/>
          <Tag label="weak" color="weak"/>
        </div>
      </div>
    </section>
    <section class="page-section">
      <header>
        <h1>button event</h1>
        <p>태그를 컨트롤할때의 이벤트입니다.</p>
      </header>
      <div class="page-example">
        <div class="page-flex" style="--gap:8px">
          <Tag
            label="click"
            :use-click="true"
            @click="onClickTag"/>
          <Tag
            label="remove"
            :use-remove="true"
            @remove="onClickRemoveTag"/>
        </div>
      </div>
    </section>
  </div>
</article>
</template>

<script setup>
import Tag from '../../../components/form/tag.vue'

function onClickTag()
{
  alert('click tag')
}

function onClickRemoveTag()
{
  alert('remove tag')
}
</script>

<style lang="scss" scoped>
@import '../page';
</style>
