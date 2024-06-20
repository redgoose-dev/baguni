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
        @keydown.enter.prevent="addTag"/>
      <template #right>
        <Button
          size="small"
          color="key-1"
          left-icon="plus"
          :disabled="!$existInputTag"
          @click="onClickAddTag">
          추가
        </Button>
      </template>
    </FormGroup>
    <div>
      <Button
        size="small"
        color="key-3"
        left-icon="tag"
        @click="onClickOpenTagSelector">
        태그 선택하기
      </Button>
    </div>
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
  <teleport to="#modal">
    <Modal
      :open="tagSelector.open"
      :hide-scroll="true"
      :use-shortcut="true"
      animation="bottom-up"
      @close="tagSelector.open = false">
      <TagSelector
        :limit="5"
        @submit="onSubmitTagSelector"
        @close="tagSelector.open = false"/>
    </Modal>
  </teleport>
</fieldset>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { debounce } from '../../../libs/util.js'
import Tag from '../../../components/form/tag.vue'
import FormGroup from '../../../components/form/group.vue'
import InputText from '../../../components/form/input-text.vue'
import Button from '../../../components/buttons/button-basic.vue'
import Modal from '../../../components/modal/index.vue'
import TagSelector from '../../../components/content/tag-selector/index.vue'

const $inputTagName = ref()
const props = defineProps({
  modelValue: Array,
})
const emits = defineEmits([ 'update:modelValue' ])
const inputTag = ref('')
const $existInputTag = computed(() => {
  return inputTag.value.length > 0
})
const tagSelector = reactive({
  open: false,
})

function onClickAddTag(e)
{
  addTag()
  $inputTagName.value.focus()
}

const addTag = debounce(_addTag, 30)
function _addTag()
{
  if (!inputTag.value) return
  if (props.modelValue.includes(inputTag.value)) return
  console.log(inputTag.value)
  // TODO: 태그를 추가하는데 공백이나 특수문자(,"')같은게 들어있으면 등록을 막거나 치환해줘야 한다.
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

function onClickOpenTagSelector()
{
  tagSelector.open = true
}
function onSubmitTagSelector(tags)
{
  let arr = []
  tags.forEach(tag => {
    if (props.modelValue.includes(tag.name)) return
    arr.push(tag.name)
  })
  updateTags([
    ...props.modelValue,
    ...arr,
  ])
  tagSelector.open = false
}
</script>

<style src="./manage-tags.scss" lang="scss" scoped></style>
