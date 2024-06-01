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
        <p>- 사이즈: 140px * 140px</p>
        <nav>
          <Dropdown :use-value="true">
            <template #trigger>
              <ButtonBasic size="small" right-icon="chevron-down" color="weak">
                커버 이미지 컨트롤
              </ButtonBasic>
            </template>
            <Context
              :items="[
                { key: 'context-1', label: '이미지 업로드' },
                { key: 'context-2', label: '편집' },
                { key: 'context-3', label: '삭제하기' },
              ]"
              @select=""/>
          </Dropdown>
        </nav>
      </div>
    </div>
  </ShadowBox>
</fieldset>
</template>

<script setup>
import ShadowBox from '../../../components/content/shadow-box.vue'
import Icon from '../../../components/icons/index.vue'
import ButtonBasic from '../../../components/buttons/button-basic.vue'
import Context from '../../../components/navigation/context.vue'
import Dropdown from '../../../components/navigation/dropdown.vue'
</script>

<style src="./manage-cover-image.scss" lang="scss" scoped></style>
