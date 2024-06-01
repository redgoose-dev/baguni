<template>
<article class="share">
  <ModalHeader title="에셋 공유하기">
    <template #description>에셋 데이터를 공개하여 공유할 수 있습니다.</template>
    <template #side>
      <ModalButtonClose @click="emits('close')"/>
    </template>
  </ModalHeader>
  <fieldset class="address">
    <legend>에셋공유 주소</legend>
    <FormGroup v-if="true">
      <InputText
        type="search"
        placeholder="type=text"
        value="아직 공유되지 않았습니다."
        :readonly="true"/>
      <template #right>
        <ButtonBasic color="key-1" left-icon="square-plus">
          공유 만들기
        </ButtonBasic>
      </template>
    </FormGroup>
    <FormGroup v-else>
      <InputText type="search" placeholder="https://" :readonly="true"/>
      <template #right>
        <ButtonBasic color="danger" left-icon="eraser">
          공유삭제
        </ButtonBasic>
      </template>
    </FormGroup>
    <p>
      에셋 공유를 만들거나 제거할 수 있습니다.<br/>
      공유한 에셋은 새로운 URL 주소로 만들어지며 제거하면 열 수 없게됩니다.
    </p>
  </fieldset>
  <NavigationBottom class="bottom">
    <template #left>
      <ButtonGroup>
        <ButtonBasic
          left-icon="copy"
          color="key-1"
          title="공유주소 복사">
          주소복사
        </ButtonBasic>
        <ButtonBasic
          icon="external-link"
          color="key-2"
          title="공유주소 열기">
          열기
        </ButtonBasic>
      </ButtonGroup>
    </template>
  </NavigationBottom>
</article>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import ModalHeader from '../../../components/modal/header.vue'
import ModalButtonClose from '../../../components/modal/button-close.vue'
import FormGroup from '../../../components/form/group.vue'
import ButtonGroup from '../../../components/buttons/group.vue'
import InputText from '../../../components/form/input-text.vue'
import ButtonBasic from '../../../components/buttons/button-basic.vue'
import NavigationBottom from '../../../components/navigation/bottom.vue'

const emits = defineEmits([ 'close' ])

onMounted(() => {
  //
})
</script>

<style src="./manage-share.scss" lang="scss" scoped></style>
