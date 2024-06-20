<template>
<article class="page">
  <header class="page-header">
    <h1>
      <small>Forms</small>
      <strong>Input Text</strong>
    </h1>
    <p>글자를 작성하는 입력폼 컴포넌트 사용법과 예시를 제공합니다.</p>
  </header>
  <div class="page-content">
    <section class="page-section">
      <header>
        <h1>basic</h1>
        <p>기본적으로 사용하는 모습입니다.</p>
      </header>
      <div class="page-example">
        <div class="page-grid" style="--column:3">
          <InputText placeholder="type=text"/>
          <InputText type="password" placeholder="type=password"/>
          <InputText type="number" :min="1" :max="10" :step="0.5" placeholder="type=number"/>
          <InputText type="date" placeholder="type=date"/>
          <InputText type="time" placeholder="type=time"/>
          <InputText type="search" placeholder="type=search"/>
        </div>
      </div>
    </section>
    <section class="page-section">
      <header>
        <h1>input value</h1>
        <p>값 입력할때의 예제</p>
      </header>
      <div class="page-example">
        <InputText v-model="inputExample"/>
        <pre class="page-example-result">{{inputExample}}</pre>
      </div>
    </section>
    <section class="page-section">
      <header>
        <h1>size</h1>
        <p>다양한 사이즈</p>
      </header>
      <div class="page-example">
        <div class="page-grid" style="--column:2;--v-items:center">
          <InputText size="small" placeholder="size=small"/>
          <InputText placeholder="size=normal"/>
        </div>
      </div>
    </section>
    <section class="page-section">
      <header>
        <h1>status</h1>
        <p>다양한 상태</p>
      </header>
      <div class="page-example">
        <div class="page-grid" style="--column:3">
          <InputText :readonly="true" placeholder="readonly"/>
          <InputText :disabled="true" placeholder="disabled"/>
          <InputText color="error" placeholder="error"/>
        </div>
      </div>
    </section>
    <section class="page-section">
      <header>
        <h1>datalist</h1>
        <p>데이터 리스트 활용</p>
      </header>
      <div class="page-example">
        <InputText list="fruits"/>
        <datalist id="fruits">
          <option value="apple"/>
          <option value="banana"/>
          <option value="mango"/>
        </datalist>
      </div>
    </section>
    <section class="page-section">
      <header>
        <h1>with button</h1>
        <p>버튼과 함께 사용합니다.</p>
      </header>
      <div class="page-example">
        <div class="page-grid">
          <FormGroup>
            <template #left>
              <ButtonBasic color="weak" left-icon="info">Prefix Button</ButtonBasic>
            </template>
            <InputText type="search" placeholder="type=text"/>
            <template #right>
              <ButtonBasic color="key-3" left-icon="loader" :rotate-icon="true">
                Submit
              </ButtonBasic>
            </template>
          </FormGroup>
          <FormGroup size="small">
            <template #left>
              <ButtonBasic color="weak" size="small">Prefix Button</ButtonBasic>
            </template>
            <InputText type="search" placeholder="small" size="small"/>
            <template #right>
              <ButtonBasic color="key-3" size="small">button1</ButtonBasic>
              <ButtonBasic color="key-3" size="small">button2</ButtonBasic>
            </template>
          </FormGroup>
        </div>
      </div>
    </section>
    <section class="page-section">
      <header>
        <h1>textarea</h1>
        <p>여러줄의 글자를 입력합니다.</p>
      </header>
      <div class="page-example">
        <Textarea v-model="textareaExample"/>
        <pre class="page-example-result">{{textareaExample}}</pre>
      </div>
    </section>
  </div>
</article>
</template>

<script setup>
import { ref } from 'vue'
import InputText from '../../../components/form/input-text.vue'
import ButtonBasic from '../../../components/buttons/button-basic.vue'
import FormGroup from '../../../components/form/group.vue'
import Textarea from '../../../components/form/textarea.vue'

const inputExample = ref('keyword')
const textareaExample = ref('description..')
</script>

<style lang="scss" scoped>
@import '../page';
</style>
