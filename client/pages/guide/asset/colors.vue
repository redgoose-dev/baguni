<template>
<article class="page">
  <header class="page-header">
    <h1>
      <small>Asset</small>
      <strong>Colors</strong>
    </h1>
    <p>앱에서 사용되는 컬러 가이드</p>
  </header>
  <div class="page-content">
    <section class="page-section">
      <header>
        <h1>light mode</h1>
        <p>라이트모드에서 사용되는 컬러들입니다.</p>
      </header>
      <div class="page-example light-mode">
        <ul class="colors">
          <li>
            <i style="--color: var(--color-bg)"/>
            <em>--color-bg</em>
          </li>
          <li>
            <i style="--color: var(--color-base)"/>
            <em>--color-base</em>
          </li>
          <li>
            <i style="--color: var(--color-weak)"/>
            <em>--color-weak</em>
          </li>
          <li>
            <i style="--color: var(--color-key-1)"/>
            <em>--color-key-1</em>
          </li>
          <li>
            <i style="--color: var(--color-key-2)"/>
            <em>--color-key-2</em>
          </li>
          <li>
            <i style="--color: var(--color-key-3)"/>
            <em>--color-key-3</em>
          </li>
          <li>
            <i style="--color: var(--color-success)"/>
            <em>--color-success</em>
          </li>
          <li>
            <i style="--color: var(--color-danger)"/>
            <em>--color-danger</em>
          </li>
          <li>
            <i style="--color: var(--color-light)"/>
            <em>--color-light</em>
          </li>
          <li>
            <i style="--color: var(--color-dark)"/>
            <em>--color-dark</em>
          </li>
        </ul>
      </div>
    </section>
  </div>
</article>
</template>

<script setup>
</script>

<style lang="scss" scoped>
@use '../../../assets/scss/mixins';
@forward '../page';

.light-mode {
  background: var(--color-light);
}
.dark-mode {
  background: var(--color-dark);
}

.colors {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px 12px;
  li {
    text-align: center;
  }
  i {
    display: block;
    margin: 0 auto;
    width: 78px;
    aspect-ratio: 1/1;
    border-radius: 50%;
    box-shadow:
      inset 0 0 0 .5px mixins.mix-alpha(var(--color-dark), 15%),
      0 0 32px hsla(0 0% 0% / 12%),
      0 0 12px hsla(0 0% 0% / 8%);
    background-color: var(--color);
  }
  em {
    display: block;
    margin: 8px 0 0 0;
    font-style: normal;
    font-family: var(--font-eng);
    font-size: 11px;
    line-height: 1.15;
    color: var(--color-weak);
  }
}
</style>
