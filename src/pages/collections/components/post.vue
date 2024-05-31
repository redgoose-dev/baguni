<template>
<article class="post">
  <ModalHeader :title="header.title">
    <template #description>{{header.description}}</template>
  </ModalHeader>
  <form class="post__form" @submit.prevent>
    <fieldset>
      <legend>컬렉션의 정보 입력</legend>
      <div class="field">
        <p><label for="title">제목</label></p>
        <div>
          <InputText
            id="title"
            placeholder="컬렉션의 제목"
            :maxlength="50"/>
        </div>
      </div>
      <div class="field">
        <p><label for="description">컬렉션의 설명</label></p>
        <div>
          <Textarea
            id="description"
            placeholder="컬렉션의 설명을 입력해주세요."/>
        </div>
      </div>
    </fieldset>
    <fieldset>
      <legend>컬렉션의 커버 이미지 만들기</legend>
      <div class="field">
        <p><label for="">커버 이미지</label></p>
        <div class="cover">
          <div class="cover__image">
            <figure>
              <img v-if="false" src="https://goose.redgoose.me/data/upload/original/201906/rg3811.jpg" alt="">
              <i v-else>
                <Icon name="image"/>
              </i>
            </figure>
          </div>
          <nav class="cover__control">
            <Button title="업로드" icon="upload" theme="circle" color="key-1" size="big"/>
            <Button title="영역 편집" icon="edit" theme="circle" color="" size="big"/>
            <Button title="삭제" icon="trash-2" theme="circle" color="danger" size="big"/>
          </nav>
        </div>
      </div>
    </fieldset>
    <nav class="post__submit">
      <Button @click="emits('close')">
        닫기
      </Button>
      <Button type="submit" color="key-1">
        컬렉션 만들기
      </Button>
    </nav>
  </form>
</article>
</template>

<script setup>
import { computed } from 'vue'
import ModalHeader from '../../../components/modal/header.vue'
import InputText from '../../../components/form/input-text.vue'
import Textarea from '../../../components/form/textarea.vue'
import Button from '../../../components/buttons/button-basic.vue'
import Icon from '../../../components/icons/index.vue'

const props = defineProps({
  mode: String, // create,edit
})
const emits = defineEmits([ 'close', 'submit' ])
const header = computed(() => {
  switch (props.mode)
  {
    case 'create':
    default:
      return {
        title: '컬렉션 만들기',
        description: '새로운 컬렉션을 만듭니다.',
      }
    case 'edit':
      return {
        title: '컬렉션 수정하기',
        description: '컬렉션 정보를 수정합니다.',
      }
  }
})
</script>

<style src="./post.scss" lang="scss" scoped></style>
