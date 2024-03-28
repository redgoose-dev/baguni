<template>
<article class="page">
  <header class="page-header">
    <h1>
      <small>Navigation</small>
      <strong>Button</strong>
    </h1>
    <p>다양한 디자인과 기능을 갖춘 버튼 컴포넌트의 사용법과 예시를 제공합니다.</p>
  </header>
  <div class="page-content">
    <section class="page-section">
      <header>
        <h1>basic</h1>
        <p>기본적으로 사용하는 모습입니다.</p>
      </header>
      <div class="page-example">
        <ButtonBasic>Basic Button</ButtonBasic>
      </div>
    </section>
    <section class="page-section">
      <header>
        <h1>size</h1>
        <p>버튼의 사이즈에대한 예제입니다.</p>
      </header>
      <div class="page-example">
        <div class="page-grid" style="--column:3; --v-align:center;">
          <ButtonBasic size="small">small</ButtonBasic>
          <ButtonBasic>normal</ButtonBasic>
          <ButtonBasic size="big">big</ButtonBasic>
        </div>
      </div>
    </section>
    <section class="page-section">
      <header>
        <h1>colors</h1>
        <p>버튼의 컬러에 대한 예제입니다.</p>
      </header>
      <div class="page-example">
        <div class="page-grid" style="--column:4">
          <ButtonBasic>normal</ButtonBasic>
          <ButtonBasic color="key-1">key-1</ButtonBasic>
          <ButtonBasic color="key-2">key-2</ButtonBasic>
          <ButtonBasic color="key-3">key-3</ButtonBasic>
          <ButtonBasic color="success">success</ButtonBasic>
          <ButtonBasic color="danger">danger</ButtonBasic>
          <ButtonBasic color="dark">dark</ButtonBasic>
          <ButtonBasic color="weak">weak</ButtonBasic>
        </div>
      </div>
    </section>
    <section class="page-section">
      <header>
        <h1>element types</h1>
        <p>여러가지 엘리먼트나 컴포넌트를 사용합니다.</p>
      </header>
      <div class="page-grid" style="--column:4">
        <ButtonBasic href="https://redgoose.me" target="_blank">a:href</ButtonBasic>
        <ButtonBasic href="/">router-link</ButtonBasic>
        <ButtonBasic>type=button</ButtonBasic>
        <ButtonBasic type="text">text</ButtonBasic>
      </div>
    </section>
    <section class="page-section">
      <header>
        <h1>with icon</h1>
        <p>아이콘과 함께 사용합니다.</p>
      </header>
      <div class="page-example">
        <div class="page-grid" style="--column:3">
          <ButtonBasic left-icon="cloud-lightning">left icon</ButtonBasic>
          <ButtonBasic left-icon="sun"/>
          <ButtonBasic right-icon="sun">right icon</ButtonBasic>
        </div>
      </div>
    </section>
    <section class="page-section">
      <header>
        <h1>group</h1>
        <p>버튼을 여러개 묶어놓은 그룹</p>
      </header>
      <div class="page-example">
        <ButtonGroup>
          <ButtonBasic>Button</ButtonBasic>
          <ButtonBasic>Button</ButtonBasic>
          <ButtonBasic>Button</ButtonBasic>
        </ButtonGroup>
      </div>
    </section>
    <section class="page-section">
      <header>
        <h1>only icon</h1>
        <p>아이콘만 사용할때</p>
      </header>
      <div class="page-example">
        <div class="page-flex" style="--h-align:center;--v-align:center;">
          <ButtonIcon icon="cloud" color="key-1" size="small"/>
          <ButtonIcon icon="save"/>
          <ButtonIcon icon="sun" color="key-2"/>
          <ButtonIcon icon="feather" color="key-3" size="big"/>
        </div>
      </div>
    </section>
  </div>
</article>
</template>

<script setup>
import ButtonBasic from '../../../components/buttons/button-basic.vue'
import ButtonIcon from '../../../components/buttons/button-icon.vue'
import ButtonGroup from '../../../components/buttons/group.vue'
</script>

<style lang="scss" scoped>
@import '../page';
</style>
