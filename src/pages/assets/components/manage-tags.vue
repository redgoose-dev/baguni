<template>
<fieldset class="manage-tags">
  <legend>태그 입력 폼</legend>
  <p class="description">
    글의 주제, 성격 및 관련된 키워드를 쉼표로 구분하여 입력하세요. 구체적이고 관련성 높은 태그를 입력할수록 검색 결과에서 더 잘 노출됩니다.
  </p>
  <div class="add-tag">
    <FormGroup size="small">
      <InputText
        placeholder="태그이름"
        size="small"
        :maxlength="20"/>
      <template #right>
        <Button
          color="key-1"
          size="small"
          @click="">
          추가
        </Button>
      </template>
    </FormGroup>
  </div>
  <div class="tags-index">
    <Tag label="갈릭"/>
    <Tag label="바나나망고"/>
  </div>
</fieldset>
</template>

<script setup>
import Tag from '../../../components/form/tag.vue'
import FormGroup from '../../../components/form/group.vue'
import InputText from '../../../components/form/input-text.vue'
import Button from '../../../components/buttons/button-basic.vue'
</script>

<style src="./manage-tags.scss" lang="scss" scoped></style>
