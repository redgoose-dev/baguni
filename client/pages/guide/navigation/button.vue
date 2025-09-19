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
        <div class="page-grid" style="--column:3; --v-items:center;">
          <ButtonBasic size="small" left-icon="cloud">small</ButtonBasic>
          <ButtonBasic left-icon="cloud">normal</ButtonBasic>
          <ButtonBasic size="big" left-icon="cloud">big</ButtonBasic>
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
        <h1>theme</h1>
        <p>버튼의 다른 스타일들</p>
      </header>
      <h2>circle</h2>
      <p>원 형태의 아이콘 버튼으로 사용됩니다.</p>
      <div class="page-example">
        <div class="page-flex" style="--h-content:center;--v-items:center;">
          <ButtonBasic theme="circle" icon="cloud" size="small"/>
          <ButtonBasic theme="circle" icon="cloud-drizzle"/>
          <ButtonBasic theme="circle" icon="cloud-lightning" size="big"/>
        </div>
      </div>
    </section>
  </div>
</article>
</template>

<script setup>
import ButtonBasic from '../../../components/buttons/button-basic.vue'
import ButtonGroup from '../../../components/buttons/group.vue'
</script>

<style lang="scss" scoped>
@forward '../page';
</style>
