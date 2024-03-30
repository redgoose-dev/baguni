<template>
<article class="page">
  <header class="page-header">
    <h1>
      <small>Forms</small>
      <strong>Checkbox & Radio</strong>
    </h1>
    <p>여러항목을 선택하는 컴포넌트 사용법과 예시를 제공합니다.</p>
  </header>
  <div class="page-content">
    <section class="page-section">
      <header>
        <h1>checkbox</h1>
        <p>여러항목을 선택하는 체크박스 컴포넌트</p>
      </header>
      <div class="page-example">
        <div class="page-grid" style="--column:3">
          <Label name="Apple">
            <Checkbox v-model="checkboxValue.apple"/>
          </Label>
          <Label name="Banana">
            <Checkbox v-model="checkboxValue.banana"/>
          </Label>
          <Label name="Mango">
            <Checkbox v-model="checkboxValue.mango"/>
          </Label>
        </div>
        <pre class="page-example-result">checked: {{checkboxValue}}</pre>
      </div>
      <p>사이즈</p>
      <div class="page-example">
        <div class="page-flex" style="--v-align:center">
          <Label name="normal">
            <Checkbox name="size"/>
          </Label>
          <Label name="size=small">
            <Checkbox name="size" size="small"/>
          </Label>
        </div>
      </div>
      <p>상태</p>
      <div class="page-example">
        <div class="page-flex" style="--v-align:center">
          <Label name="normal">
            <Checkbox name="status"/>
          </Label>
          <Label name="disabled" :disabled="true">
            <Checkbox name="status" :disabled="true"/>
          </Label>
        </div>
      </div>
    </section>
    <section class="page-section">
      <header>
        <h1>radio</h1>
        <p>여러항목 중 하나를 선택하는 라디오 컴포넌트</p>
      </header>
      <div class="page-example">
        <div class="page-grid" style="--column:3">
          <Label name="Apple">
            <Radio
              v-model="radioValue"
              name="fruits"
              value="apple"/>
          </Label>
          <Label name="Banana">
            <Radio
              v-model="radioValue"
              name="fruits"
              value="banana"/>
          </Label>
          <Label name="Mango">
            <Radio
              v-model="radioValue"
              name="fruits"
              value="mango"/>
          </Label>
        </div>
        <pre class="page-example-result">Checked value: {{radioValue}}</pre>
      </div>
      <p>사이즈</p>
      <div class="page-example">
        <div class="page-flex" style="--v-align:center">
          <Label name="normal">
            <Radio name="size"/>
          </Label>
          <Label name="size=small">
            <Radio name="size" size="small"/>
          </Label>
        </div>
      </div>
      <p>상태</p>
      <div class="page-example">
        <div class="page-flex" style="--v-align:center">
          <Label name="normal">
            <Radio name="status"/>
          </Label>
          <Label name="disabled" :disabled="true">
            <Radio name="status" :disabled="true"/>
          </Label>
        </div>
      </div>
    </section>
  </div>
</article>
</template>

<script setup>
import { ref } from 'vue'
import Checkbox from '../../../components/form/checkbox.vue'
import Radio from '../../../components/form/radio.vue'
import Label from '../../../components/form/label.vue'

const checkboxValue = ref({ apple: false, banana: false, mango: false })
const radioValue = ref('apple')
</script>

<style lang="scss" scoped>
@import '../page';
</style>
