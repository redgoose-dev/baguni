<template>
<article class="post">
  <ModalHeader title="콜렉션 만들기">
    <template #description>
      새로운 콜렉션을 만듭니다.
    </template>
  </ModalHeader>
  <form class="post__form" @submit.prevent>
    <fieldset class="field">
      <p>
        <label for="title">제목</label>
      </p>
      <div>
        <InputText
          id="title"/>
      </div>
    </fieldset>
    <fieldset class="field">
      <p>
        <label for="description">콜렉션의 설명</label>
      </p>
      <div>
        <Textarea
          id="description"/>
      </div>
    </fieldset>
    <fieldset class="field">
      <p>
        <label for="">커버 이미지</label>
      </p>
      <div>
        TODO: 커버 이미지 폼
      </div>
    </fieldset>
    <nav class="post__submit">
      <Button @click="emits('close')">
        닫기
      </Button>
      <Button type="submit" color="key-1">
        콜렉션 만들기
      </Button>
    </nav>
  </form>
</article>
</template>

<script setup>
import ModalHeader from '../../../components/modal/header.vue'
import InputText from '../../../components/form/input-text.vue'
import Textarea from '../../../components/form/textarea.vue'
import Button from '../../../components/buttons/button-basic.vue'

const emits = defineEmits([ 'close', 'submit' ])
</script>

<style src="./post.scss" lang="scss" scoped></style>
