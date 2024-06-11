<template>
<div
  role="button"
  aria-pressed="false"
  tabindex="0"
  :class="[
    'item',
    props.active && 'item--on',
  ]"
  @click="onClick"
  @keydown="onKeydown">
  <figure class="item__image">
    <img
      src="https://goose.redgoose.me/files/resize/?path=/original/202405/cannedgoods_combining_liquid_kittens_from_science_glass_into_fl.webp&type=&width=150&quality=85"
      draggable="false"
      alt="Collection cover image"/>
    <span v-if="props.active">
      <Icon name="check"/>
    </span>
  </figure>
  <div class="item__body">
    <h3>망고 컬렉션 선택된거</h3>
    <p>데이터베이스에서의 필드랑 연결되어 있는 각 항목의 데이터 목록이다.</p>
  </div>
</div>
</template>

<script setup>
import { ref } from 'vue'
import Icon from '../../../components/icons/index.vue'

const props = defineProps({
  active: Boolean,
})
const emits = defineEmits([ 'check' ])

function onClick()
{
  emits('check')
}

function onKeydown(e)
{
  if (e.key === 'Enter' || e.key === ' ') onClick()
}
</script>

<style src="./item.scss" lang="scss" scoped></style>
