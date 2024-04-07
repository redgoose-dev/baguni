<template>
<fieldset class="manage-file-upload">
  <legend>에셋 이미지</legend>
  <div
    v-if="uploaded"
    ref="$uploadedFile"
    class="uploaded-file">
    <ShadowBox class="uploaded-file__box">
      <figure class="uploaded-file__image">
        <button
          type="button"
          title="Open image on overlay"
          class="image"
          @click="">
          <img src="https://goose.redgoose.me/data/upload/original/202003/triangle-beeple-001.jpg" alt="">
        </button>
        <nav>
          <Button
            type="button"
            icon="trash-2"
            theme="circle"
            color="danger"
            @click=""/>
        </nav>
      </figure>
      <fieldset class="uploaded-file__body">
        <legend class="hidden">파일정보와 파일이름 변경 폼</legend>
        <div class="filename">
          <label for="filename">파일이름</label>
          <InputText
            name="filename"
            id="filename"
            placeholder="filename.jpg"
            size="small"/>
        </div>
        <div class="info">
          <dl>
            <dt>타입</dt>
            <dd>image/jpeg</dd>
          </dl>
          <dl>
            <dt>사이즈</dt>
            <dd>320kb</dd>
          </dl>
          <dl>
            <dt>이미지 크기</dt>
            <dd>100px*100px</dd>
          </dl>
          <dl>
            <dt>날짜</dt>
            <dd>0000-00-00 22:22:22</dd>
          </dl>
        </div>
      </fieldset>
    </ShadowBox>
  </div>
  <div
    v-else
    ref="$uploadFile"
    :class="[
      'upload-file',
      false && 'uploading',
    ]">
    <ShadowBox class="upload-file__box">
      <figure class="upload-file__body">
        <img src="../../../assets/images/img-upload-file.svg" alt="upload file"/>
        <figcaption>
          <h4>드래그앤 드롭을 하거나 버튼을 누르세요.</h4>
          <p>최대 20MB 사이즈의 파일까지 업로드할 수 있습니다.</p>
        </figcaption>
      </figure>
      <nav class="upload-file__button">
        <Button
          type="button"
          color="key-1"
          @click="">
          찾아보기..
        </Button>
      </nav>
    </ShadowBox>
  </div>
</fieldset>
</template>

<script setup>
import { ref, computed } from 'vue'
import Button from '../../../components/buttons/button-basic.vue'
import ShadowBox from '../../../components/content/shadow-box.vue'
import InputText from '../../../components/form/input-text.vue'

const $uploadFile = ref()
const $uploadedFile = ref()

const uploaded = computed(() => {
  return false
})
</script>

<style src="./upload-file.scss" lang="scss" scoped></style>
