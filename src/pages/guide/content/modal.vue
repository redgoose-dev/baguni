<template>
<article class="page">
  <header class="page-header">
    <h1>
      <small>Content</small>
      <strong>Modal</strong>
    </h1>
    <p>'&lt;dialog/>'엘리먼트를 이용하여 레이어 윈도우창을 띄웁니다.</p>
  </header>
  <div class="page-content">
    <section class="page-section">
      <header>
        <h1>window</h1>
        <p>창모드로 열린 모습입니다.</p>
      </header>
      <div class="page-example">
        <div class="page-grid" style="--p-content:center">
          <ButtonBasic
            color="key-1"
            @click="onClickOpenWindow">
            Open window
          </ButtonBasic>
        </div>
        <pre class="page-example-result">open: {{modalWindow}}</pre>
      </div>
    </section>
    <section class="page-section">
      <header>
        <h1>full screen</h1>
        <p>전체 사이즈로 열린 모습입니다.</p>
      </header>
      <div class="page-example">
        <div class="page-grid" style="--p-content:center">
          <ButtonBasic
            color="key-1"
            @click="onClickOpenFullSizeWindow">
            Open full size window
          </ButtonBasic>
        </div>
        <pre class="page-example-result">open: {{modalFullSize}}</pre>
      </div>
    </section>
  </div>
</article>
<teleport to="#modal">
  <Modal
    :open="modalWindow"
    :use-shortcut="true"
    animation="fade"
    class="modal-window"
    @close="modalWindow = false">
    <article class="modal-content">
      <h1>Hello modal window</h1>
      <p>description..</p>
    </article>
    <ModalClose @click="modalWindow = false"/>
  </Modal>
  <Modal
    :open="modalFullSize"
    :full="true"
    :use-shortcut="true"
    animation="bottom-up"
    @close="modalFullSize = false">
    <article class="modal-content full">
      <h1>Full screen modal</h1>
      <p>description..</p>
      <nav>
        <div>
          <ButtonBasic color="danger" @click="modalFullSize = false">
            Close modal
          </ButtonBasic>
        </div>
      </nav>
    </article>
  </Modal>
</teleport>
</template>

<script setup>
import { ref } from 'vue'
import Modal from '../../../components/modal/index.vue'
import ModalClose from '../../../components/modal/close.vue'
import ButtonBasic from '../../../components/buttons/button-basic.vue'

const modalWindow = ref(false)
const modalFullSize = ref(false)

function onClickOpenWindow()
{
  modalWindow.value = true
}

function onClickOpenFullSizeWindow()
{
  modalFullSize.value = true
}
</script>

<style lang="scss" scoped>
@use '../../../assets/scss/mixins';
@forward '../page';
.modal-window {
  --modal-min-width: 480px;
  --modal-padding: 30px;
}
.modal-content {
  h1 {
    margin: 0;
    font-size: 24px;
    line-height: 1.05;
  }
  p {
    margin: 8px 0 0;
    font-size: 13px;
  }
  nav {
    display: flex;
    margin: 24px 0 0;
  }
  &.full {
    padding: 40px;
  }
}
</style>
