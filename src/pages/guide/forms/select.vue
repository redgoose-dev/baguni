<template>
<article class="page">
  <header class="page-header">
    <h1>
      <small>Forms</small>
      <strong>Select</strong>
    </h1>
    <p>여러 항목 중 하나를 선택하는 컴포넌트 사용법과 예시를 제공합니다.</p>
  </header>
  <div class="page-content">
    <section class="page-section">
      <header>
        <h1>basic</h1>
        <p>기본적으로 사용하는 모습입니다.</p>
      </header>
      <div class="page-example">
        <Select :options="exampleOptions"/>
      </div>
    </section>
    <section class="page-section">
      <header>
        <h1>select value</h1>
        <p>값을 선택할때의 예제</p>
      </header>
      <div class="page-example">
        <Select
          v-model="basicExample"
          :options="exampleOptions"/>
        <pre class="page-example-result">{{basicExample}}</pre>
      </div>
    </section>
    <section class="page-section">
      <header>
        <h1>size</h1>
        <p>다양한 사이즈</p>
      </header>
      <div class="page-example">
        <div class="page-grid" style="--column:2;--v-items:center">
          <Select
            :options="exampleOptions"
            size="small"
            placeholder="size=small"/>
          <Select
            :options="exampleOptions"
            placeholder="size=normal"/>
        </div>
      </div>
    </section>
    <section class="page-section">
      <header>
        <h1>status</h1>
        <p>다양한 상태</p>
      </header>
      <div class="page-example">
        <div class="page-grid" style="--column:2">
          <Select
            :options="exampleOptions"
            :disabled="true"
            placeholder="disabled"/>
          <Select
            :options="exampleOptions"
            color="error"
            placeholder="color=error"/>
        </div>
      </div>
    </section>
  </div>
</article>
</template>

<script setup>
import { ref } from 'vue'
import Select from '../../../components/form/select.vue'

const basicExample = ref('apple')
const exampleOptions = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Mango', value: 'mango' },
]
</script>

<style lang="scss" scoped>
@import '../page';
</style>
