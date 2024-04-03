<template>
<article class="page">
  <header class="page-header">
    <h1>
      <small>Navigation</small>
      <strong>Context</strong>
    </h1>
    <p>컨텍스트 메뉴 컴포넌트의 가이드 예제입니다.</p>
  </header>
  <div class="page-content">
    <section class="page-section">
      <header>
        <h1>basic</h1>
        <p>기본적으로 사용하는 모습입니다.</p>
      </header>
      <div class="page-example">
        <Context
          :items="[
            { key: 'context-1', label: 'Context #1', icon: 'cloud' },
            { key: 'context-2', label: '컨텍스트 #2', color: 'success' },
            { key: 'context-3', label: 'Context #3', icon: 'x', color: 'danger' },
          ]"
          @select="onSelectBasic"/>
      </div>
    </section>
    <section class="page-section">
      <header>
        <h1>dropdown</h1>
        <p>버튼의 사이즈에대한 예제입니다.</p>
      </header>
      <div class="page-example">
        <div class="page-grid" style="--column:2;--h-items:center">
          <div>
            <Dropdown ref="$dropdown1" position="right">
              <Context
                :items="[
                  { key: 'context-1', label: 'context #1' },
                  { key: 'context-2', label: 'context #2' },
                  { key: 'context-3', label: 'context #3', icon: 'image' },
                ]"
                @select="onSelectDropdown"/>
            </Dropdown>
          </div>
          <div>
            <Dropdown ref="$dropdown2">
              <template #trigger>
                <ButtonBasic size="small" right-icon="chevron-down">
                  트리거 버튼
                </ButtonBasic>
              </template>
              <Context
                :items="[
                  { key: 'context-1', label: 'context #1' },
                  { key: 'context-2', label: 'context #2' },
                  { key: 'context-3', label: 'context #3', icon: 'image' },
                ]"
                @select="onSelectDropdown"/>
            </Dropdown>
          </div>
        </div>
      </div>
    </section>
  </div>
</article>
</template>

<script setup>
import { ref } from 'vue'
import Context from '../../../components/navigation/context.vue'
import Dropdown from '../../../components/navigation/dropdown.vue'
import ButtonBasic from '../../../components/buttons/button-basic.vue'

const $dropdown1 = ref()
const $dropdown2 = ref()

function onSelectBasic(item)
{
  console.warn('onSelectBasic()', item)
}

function onSelectDropdown(item)
{
  console.warn('onSelectDropdown()', item)
  $dropdown1.value.close()
  $dropdown2.value.close()
}
</script>

<style lang="scss" scoped>
@import '../page';
</style>
