<template>
<fieldset class="manage-tags">
  <legend>태그 입력 폼</legend>
  <p class="description">
    글의 주제, 성격 및 관련된 키워드를 쉼표로 구분하여 입력하세요. 구체적이고 관련성 높은 태그를 입력할수록 검색 결과에서 더 잘 노출됩니다.
  </p>
  <div class="add-tag">
    <FormGroup size="small">
      <InputText
        ref="$inputTagName"
        v-model="inputTag"
        placeholder="태그이름"
        size="small"
        :maxlength="20"
        @keydown.enter="addTag"/>
      <template #right>
        <Button
          size="small"
          color="key-1"
          :disabled="!_existInputTag"
          @click="onClickAddTag">
          추가
        </Button>
      </template>
    </FormGroup>
  </div>
  <div class="tags-index">
    <Tag
      v-if="props.modelValue.length > 0"
      v-for="tag in props.modelValue"
      :label="tag"
      :use-remove="true"
      color="weak"
      @remove="removeTag(tag)"/>
    <p v-else class="empty">
      태그가 없습니다.
    </p>
  </div>
</fieldset>
</template>

<script setup>
import { ref, computed } from 'vue'
import { debounce } from '../../../libs/util.js'
import Tag from '../../../components/form/tag.vue'
import FormGroup from '../../../components/form/group.vue'
import InputText from '../../../components/form/input-text.vue'
import Button from '../../../components/buttons/button-basic.vue'

const $inputTagName = ref()
const props = defineProps({
  modelValue: Array,
})
const emits = defineEmits([ 'update:modelValue' ])
const inputTag = ref('')
const _existInputTag = computed(() => {
  return inputTag.value.length > 0
})

function onClickAddTag()
{
  addTag()
  $inputTagName.value.focus()
}

const addTag = debounce(_addTag, 30)
function _addTag()
{
  if (props.modelValue.includes(inputTag.value)) return
  updateTags([
    ...props.modelValue,
    inputTag.value,
  ])
  inputTag.value = ''
}

function removeTag(tag)
{
  const idx = props.modelValue.indexOf(tag)
  let newTags = [ ...props.modelValue ]
  newTags.splice(idx, 1)
  updateTags(newTags)
}

function updateTags(newTags)
{
  emits('update:modelValue', newTags)
}
</script>

<style src="./manage-tags.scss" lang="scss" scoped></style>
