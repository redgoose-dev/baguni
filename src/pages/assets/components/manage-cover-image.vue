<template>
<fieldset class="manage-cover-image">
  <legend>커버 이미지</legend>
  <ShadowBox class="box">
    <div class="cover-image-body">
      <button
        type="button"
        title="Open image on overlay"
        :disabled="false"
        class="image"
        @click="">
        <img
          v-if="true"
          src="https://goose.redgoose.me/data/upload/original/202003/triangle-beeple-001.jpg"
          alt="">
        <i v-else>
          <Icon name="image"/>
        </i>
      </button>
      <div class="body">
        <nav>
          <Button
            size="big"
            color="key-1"
            theme="circle"
            icon="upload"
            @click=""/>
          <Button
            size="big"
            color=""
            theme="circle"
            icon="edit"
            @click=""/>
          <Button
            size="big"
            color="danger"
            theme="circle"
            icon="trash-2"
            @click=""/>
        </nav>
        <p>- 사이즈: 140px * 140px</p>
      </div>
    </div>
  </ShadowBox>
</fieldset>
</template>

<script setup>
import ShadowBox from '../../../components/content/shadow-box.vue'
import Icon from '../../../components/icons/index.vue'
import Button from '../../../components/buttons/button-basic.vue'
</script>

<style src="./manage-cover-image.scss" lang="scss" scoped></style>
