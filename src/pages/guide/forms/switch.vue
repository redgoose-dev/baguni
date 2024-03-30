<template>
<article class="page">
  <header class="page-header">
    <h1>
      <small>Forms</small>
      <strong>Switch</strong>
    </h1>
    <p>끄고 켜는 컴포넌트 사용법과 예시를 제공합니다.</p>
  </header>
  <div class="page-content">
    <section class="page-section">
      <header>
        <h1>basic</h1>
        <p>기본적으로 사용하는 모습입니다.</p>
      </header>
      <div class="page-example">
        <div>
          <Switch v-model="basicValue"/>
        </div>
        <pre class="page-example-result">checked: {{basicValue}}</pre>
      </div>
    </section>
    <section class="page-section">
      <header>
        <h1>status</h1>
        <p>스위치의 상태</p>
      </header>
      <div class="page-example">
        <div class="page-grid" style="--column:3">
          <Switch
            v-model="statusValue.disabled"
            :disabled="true"
            label="disabled"/>
          <Switch
            v-model="statusValue.disabled"
            :readonly="true"
            label="readonly"/>
          <Switch
            v-model="statusValue.type"
            type="check"
            id="input_check"
            label="type=check"/>
        </div>
        <pre class="page-example-result">checked: {{statusValue}}</pre>
      </div>
    </section>
    <section class="page-section">
      <header>
        <h1>size</h1>
        <p>스위치의 사이즈</p>
      </header>
      <div class="page-example">
        <div class="page-grid" style="--gap:8px">
          <Switch
            v-model="sizeValue.small"
            size="small"
            label="size=small"/>
          <Switch
            v-model="sizeValue.normal"
            label="size=normal"/>
          <Switch
            v-model="sizeValue.big"
            size="big"
            label="size=big"/>
        </div>
        <pre class="page-example-result">checked: {{sizeValue}}</pre>
      </div>
    </section>
    <section class="page-section">
      <header>
        <h1>with label</h1>
        <p>레이블과 함께 사용하기</p>
      </header>
      <div class="page-example">
        <div class="page-grid" style="--column:2;--h-items:center">
          <Switch
            v-model="labelValue.theme"
            :values="[ 'light', 'dark' ]"
            :label="[ 'Light', 'Dark' ]"/>
          <Switch v-model="labelValue.label" label="Switch label"/>
        </div>
        <pre class="page-example-result">checked: {{labelValue}}</pre>
      </div>
    </section>
  </div>
</article>
</template>

<script setup>
import { ref } from 'vue'
import Switch from '../../../components/form/switch.vue'

const basicValue = ref(true)
const statusValue = ref({ disabled: false, type: false })
const sizeValue = ref({ small: false, normal: false, big: false })
const labelValue = ref({ theme: 'light', label: false })
</script>

<style lang="scss" scoped>
@import '../page';
</style>
