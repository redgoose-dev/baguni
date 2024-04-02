<template>
<aside class="side-panel">
  <form @submit.prevent="onSubmit">
    <div class="field total">
      <h3>모두</h3>
      <strong>12,000</strong>
    </div>
    <div class="field">
      <label>등록일 범위</label>
      <dl class="date-range">
        <dt>
          <label for="">시작</label>
        </dt>
        <dd>
          <InputText
            type="date"
            placeholder="YYYY-MM-DD"
            size="small"/>
        </dd>
        <dt>
          <label for="">종료</label>
        </dt>
        <dd>
          <InputText
            type="date"
            placeholder="YYYY-MM-DD"
            size="small"/>
        </dd>
      </dl>
    </div>
    <div class="field">
      <label>종류</label>
      <div>
        <Select
          size="small"
          placeholder="에셋의 종류"
          :options="[
            { value: 'image', label: '이미지' },
            { value: 'text', label: '문서' },
          ]"/>
      </div>
    </div>
    <div class="field">
      <label>정렬</label>
      <div>
        <Select
          size="small"
          placeholder="에셋 정렬"
          :options="[
            { value: 'a-z', label: 'A to Z' },
            { value: 'z-a', label: 'Z to A' },
          ]"
          @update:model-value=""/>
      </div>
    </div>
    <div class="field">
      <label>키워드</label>
      <div class="search-keyword">
        <FormGroup size="small">
          <InputText
            type="search"
            placeholder="검색 키워드"
            size="small"/>
          <template #right>
            <ButtonBasic
              color="key-1"
              size="small"
              icon="search"
              class="search-keyword__submit"
              @click="onSubmit"/>
          </template>
        </FormGroup>
      </div>
    </div>
    <nav class="bottom-nav">
      <ButtonBasic
        type="reset"
        size="small"
        color="weak">
        재설정
      </ButtonBasic>
    </nav>
  </form>
</aside>
</template>

<script setup>
import ButtonBasic from '../../../components/buttons/button-basic.vue'
import InputText from '../../../components/form/input-text.vue'
import Select from '../../../components/form/select.vue'
import FormGroup from '../../../components/form/group.vue'

async function onSubmit()
{
  console.log('onSubmit()')
}
</script>

<style src="./filter.scss" lang="scss" scoped></style>
