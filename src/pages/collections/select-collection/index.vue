<template>
<article class="collections">
  <ModalHeader title="컬렉션에 추가">
    <template #description>에셋을 추가할 컬렉션을 선택하세요.</template>
    <template #side>
      <ModalButtonClose @click="emits('close')"/>
    </template>
  </ModalHeader>
  <div class="index">
    <ul>
      <li v-for="o in 10">
        <Item
          :active="ids.includes(o)"
          @check="onCheckItem(o)"/>
      </li>
    </ul>
  </div>
  <NavigationBottom class="bottom">
    <template #left>
      <ButtonBasic
        left-icon="plus"
        @click="create.open = true">
        새로운 컬렉션
      </ButtonBasic>
    </template>
    <template #right>
      <ButtonBasic
        left-icon="check"
        color="key-1"
        @click="onSubmit">
        완료
      </ButtonBasic>
    </template>
  </NavigationBottom>
</article>
<teleport to="#modal">
  <Modal
    :open="create.open"
    :hide-scroll="true"
    @close="create.open = false">
    <PostCollection
      mode="create"/>
  </Modal>
</teleport>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import Modal from '../../../components/modal/index.vue'
import ModalHeader from '../../../components/modal/header.vue'
import ModalButtonClose from '../../../components/modal/button-close.vue'
import ButtonBasic from '../../../components/buttons/button-basic.vue'
import PostCollection from '../components/post.vue'
import NavigationBottom from '../../../components/navigation/bottom.vue'
import Item from './item.vue'

const props = defineProps({
  id: Number,
})
const emits = defineEmits([ 'close' ])
const ids = ref([])
const create = reactive({
  open: false,
})

function onCheckItem(id)
{
  if (ids.value.includes(id))
  {
    let idx = ids.value.indexOf(id)
    if (idx !== -1) ids.value.splice(idx, 1)
  }
  else
  {
    ids.value.push(id)
  }
}

async function onSubmit()
{
  console.log('onSubmit()', ids.value)
  emits('close')
}
</script>

<style src="./index.scss" lang="scss" scoped></style>
