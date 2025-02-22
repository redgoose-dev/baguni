<template>
<article class="page">
  <header class="page-header">
    <h1>
      <small>Asset</small>
      <strong>Icons</strong>
    </h1>
    <p>다양한 아이콘 디자인과 활용 방법에 대한 안내와 예시를 제공합니다.</p>
  </header>
  <div class="page-content">
    <section class="page-section">
      <header>
        <h1>index</h1>
        <p>sdgs</p>
      </header>
      <p>
        제작사 <a href="https://lucide.dev" target="_blank">lucide.dev</a> 에서 아이콘을 탐색할 수 있습니다.<br/>
        아이콘 이름을 `name` props 값으로 사용합니다.
      </p>
    </section>
    <section class="page-section">
      <header>
        <h1>color</h1>
        <p>아이콘의 컬러 예제</p>
      </header>
      <div class="page-example">
        <ul class="icons-index" style="--icons-column: 3">
          <li>
            <Icon name="cloud" color="var(--color-key-1)"/>
            <span>--color-key-1</span>
          </li>
          <li>
            <Icon name="cloud" color="var(--color-key-2)"/>
            <span>--color-key-2</span>
          </li>
          <li>
            <Icon name="cloud" color="var(--color-key-3)"/>
            <span>--color-key-3</span>
          </li>
        </ul>
      </div>
    </section>
    <section class="page-section">
      <header>
        <h1>size</h1>
        <p>아이콘의 사이즈 예제</p>
      </header>
      <div class="page-example">
        <ul class="icons-index" style="--icons-column: 3">
          <li>
            <Icon name="cloud-snow" size="24px"/>
            <span>24px</span>
          </li>
          <li>
            <Icon name="cloud-snow" size="48px"/>
            <span>48px</span>
          </li>
          <li>
            <Icon name="cloud-snow" size="72px"/>
            <span>72px</span>
          </li>
        </ul>
      </div>
    </section>
    <section class="page-section">
      <header>
        <h1>stroke</h1>
        <p>아이콘의 선 두께 예제</p>
      </header>
      <div class="page-example">
        <ul class="icons-index" style="--icons-column: 3">
          <li>
            <Icon name="cloud-snow" size="36px" :stroke=".5"/>
            <span>0.5</span>
          </li>
          <li>
            <Icon name="cloud-snow" size="36px" :stroke="1"/>
            <span>1</span>
          </li>
          <li>
            <Icon name="cloud-snow" size="36px" :stroke="2"/>
            <span>2</span>
          </li>
        </ul>
      </div>
    </section>
    <section class="page-section">
      <header>
        <h1>animation</h1>
        <p>아이콘 애니메이션 예제</p>
      </header>
      <div class="page-example">
        <ul class="icons-index" style="--icons-column: 3">
          <li>
            <Icon name="loader" size="36px" animation="rotate"/>
            <span>rotate</span>
          </li>
        </ul>
      </div>
    </section>
  </div>
</article>
</template>

<script setup>
import { computed } from 'vue'
import Icon from '../../../components/icons/index.vue'
</script>

<style lang="scss" scoped>
@use '../../../assets/scss/mixins';
@forward '../page';

.icons-index {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  grid-template-columns: repeat(var(--icons-column, 5), 1fr);
  gap: 4px;
  li {
    display: grid;
    place-content: center;
    aspect-ratio: 1 / 1;
    background: mixins.mix-alpha(var(--color-base), 5%);
    text-align: center;
  }
  svg {
    --icon-margin: 0 auto;
    --icon-size: 28px;
    --icon-stroke: 1.5;
  }
  span, input {
    display: block;
    text-align: center;
    margin: 8px 0 0;
    font-size: 10px;
    line-height: 1.05;
    font-family: var(--font-eng);
    color: var(--color-weak);
  }
  input {
    border: none;
    background: none;
    outline: none;
  }
}
</style>
