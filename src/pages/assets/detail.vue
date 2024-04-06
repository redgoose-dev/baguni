<template>
<article class="asset">
  <figure class="asset-image">
    <button
      type="button"
      class="trigger"
      @click="">
<!--      <img src="https://goose.redgoose.me/data/upload/original/202003/triangle-beeple-001.jpg" alt="">-->
      <img src="https://goose.redgoose.me/data/upload/original/201905/kjh51-cs3.jpg" alt="">
    </button>
  </figure>
  <nav class="asset-nav">
    <Button icon="bookmark" theme="circle" size="big" color="key-1"/>
    <Button icon="download" theme="circle" size="big"/>
    <Button icon="copy" theme="circle" size="big"/>
    <Dropdown v-model="controlOption.open">
      <template #trigger>
        <Button icon="more-horizontal" theme="circle" size="big"/>
      </template>
      <Context :items="controlOption.context"/>
    </Dropdown>
  </nav>
  <div class="asset-body">
    <aside class="asset-body__side">
      <ShadowBox class="wrap">
        <section>
          <h1>파일이름</h1>
          <p>filename.jpg</p>
        </section>
        <section>
          <h1>타입</h1>
          <p>IMAGE</p>
        </section>
        <section>
          <h1>사이즈</h1>
          <p>300kb</p>
        </section>
        <section>
          <h1>이미지 크기</h1>
          <p>240px * 240px</p>
        </section>
        <section>
          <h1>등록일</h1>
          <p>2024-12-12 11:11:11</p>
        </section>
      </ShadowBox>
    </aside>
    <div class="asset-body__content">
      <h1 class="title">에셋 제목제목</h1>
      <div class="content-body">
        특정 데이터의 조회수를 데이터베이스에서 구성하는 방법은 여러 가지가 있을 수 있지만, 가장 일반적인 방법은 해당 데이터를 조회할 때마다 조회수를 증가시키는 방법입니다. 이를 위해서는 두 가지 주요 요소가 필요합니다.<br/>
        <br/>
        조회수를 저장할 필드: 조회수를 저장할 별도의 필드가 필요합니다. 이 필드는 해당 데이터를 식별할 수 있는 고유한 식별자와 함께 저장되어야 합니다.
      </div>
      <article class="tags">
        <h1>태그</h1>
        <p>
          <Tag label="겨울"/>
          <Tag label="겨울산"/>
          <Tag label="평원"/>
        </p>
      </article>
    </div>
  </div>
</article>
</template>

<script setup>
import { ref, reactive } from 'vue'
import Tag from '../../components/form/tag.vue'
import Button from '../../components/buttons/button-basic.vue'
import Dropdown from '../../components/navigation/dropdown.vue'
import Context from '../../components/navigation/context.vue'
import ShadowBox from '../../components/content/shadow-box.vue'

const controlOption = reactive({
  open: false,
  context: [
    { label: '공유하기', icon: 'share-2' },
    { label: '수정', icon: 'edit' },
    { label: '삭제', icon: 'trash-2', color: 'danger' },
  ],
})
</script>

<style src="./detail.scss" lang="scss" scoped></style>
