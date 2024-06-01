<template>
<article class="asset">
  <figure class="asset-image">
    <button
      type="button"
      class="trigger"
      @click="">
      <img src="https://goose.redgoose.me/data/upload/original/202003/triangle-beeple-001.jpg" alt="">
<!--      <img src="https://goose.redgoose.me/data/upload/original/201905/kjh51-cs3.jpg" alt="">-->
    </button>
  </figure>
  <nav class="asset-nav">
    <ButtonBasic
      title="컬렉션"
      icon="bookmark"
      theme="circle"
      size="big"
      color="key-1"
      @click="collection.open = true"/>
    <ButtonBasic
      title="다운로드"
      icon="download"
      theme="circle"
      size="big"/>
    <ButtonBasic
      title="이미지 복사하기"
      icon="copy"
      theme="circle"
      size="big"/>
    <Dropdown v-model="controlOption.open">
      <template #trigger>
        <ButtonBasic
          title="옵션"
          icon="more-horizontal"
          theme="circle"
          size="big"
          :color="controlOption.open ? 'blur' : ''"/>
      </template>
      <Context
        :items="controlOption.context"
        @select="onSelectAssetManage"/>
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
<teleport to="#modal">
  <Modal
    :open="share.open"
    :hide-scroll="true"
    @close="share.open = false">
    <ManageShare
      :id="share.id"
      @close="share.open = false"/>
  </Modal>
  <Modal
    :open="collection.open"
    :hide-scroll="true"
    @close="collection.open = false">
    <SelectCollection
      :id="collection.id"
      @close="collection.open = false"/>
  </Modal>
</teleport>
</template>

<script setup>
import { reactive } from 'vue'
import Tag from '../../components/form/tag.vue'
import ButtonBasic from '../../components/buttons/button-basic.vue'
import Dropdown from '../../components/navigation/dropdown.vue'
import Context from '../../components/navigation/context.vue'
import ShadowBox from '../../components/content/shadow-box.vue'
import Modal from '../../components/modal/index.vue'
import ManageShare from './components/manage-share.vue'
import SelectCollection from '../collections/select-collection/index.vue'

const controlOption = reactive({
  open: false,
  context: [
    { key: 'share', label: '공유하기', icon: 'share-2' },
    { key: 'edit', label: '수정', icon: 'edit' },
    { key: 'delete', label: '삭제', icon: 'trash-2', color: 'danger' },
  ],
})
const share = reactive({
  id: undefined,
  open: false,
})
const collection = reactive({
  id: undefined,
  open: false,
})

function onSelectAssetManage(item)
{
  switch (item.key)
  {
    case 'share':
      share.open = true
      break
    case 'edit':
      break
    case 'delete':
      break
  }
}
</script>

<style src="./detail.scss" lang="scss" scoped></style>
