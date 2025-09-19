<template>
<article class="page">
  <header class="page-header">
    <h1>
      <small>Forms</small>
      <strong>ETC</strong>
    </h1>
    <p>그 외에 사용할 수 있는 폼 컴포넌트들입니다.</p>
  </header>
  <div class="page-content">
    <section class="page-section">
      <header>
        <h1>slider</h1>
        <p>"input[type=range]" 엘리먼트를 활용한 UI 컴포넌트</p>
      </header>
      <div class="page-example">
        <div class="page-grid ex-sliders">
          <div class="page-flex">
            <label for="slider-normal">normal</label>
            <Slider
              v-model="exampleSlider.normal"
              id="slider-normal"
              :min="10"
              :max="90"
              :step="5"/>
            <em>value: {{exampleSlider.normal}}</em>
          </div>
          <div class="page-flex">
            <label for="slider-disabled">disabled</label>
            <Slider
              v-model="exampleSlider.disabled"
              id="slider-disabled"
              :disabled="true"/>
            <em>value: {{exampleSlider.disabled}}</em>
          </div>
          <div class="page-flex">
            <label for="slider-tiny">tiny</label>
            <Slider
              v-model="exampleSlider.tiny"
              id="slider-tiny"
              :min="1"
              :max="4"
              style="--slider-width:240px"/>
            <em>value: {{exampleSlider.tiny}}</em>
          </div>
        </div>
      </div>
    </section>
  </div>
</article>
</template>

<script setup>
import { ref, reactive } from 'vue'
import Slider from '../../../components/form/slider.vue'

const exampleSlider = reactive({
  normal: 50,
  disabled: 50,
  tiny: 1,
})
</script>

<style lang="scss" scoped>
@forward '../page';

.ex-sliders {
  user-select: none;
  .page-flex {
    --v-items: center;
  }
  label {
    display: block;
    width: 72px;
    font-size: 14px;
    font-weight: 600;
  }
  em {
    display: block;
    font-style: normal;
    font-size: 12px;
    &:before,
    &:after {
      content: '"';
    }
  }
}
</style>
