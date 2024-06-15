<template>
<div class="empty-content">
  <Icon :name="props.icon"/>
  <p>{{props.message}}</p>
</div>
</template>

<script setup>
import Icon from '../icons/index.vue'

const props = defineProps({
  icon: { type: String, default: 'bone' },
  message: { type: String, default: '아이템이 없습니다.' },
})
</script>

<style lang="scss" scoped>
.empty-content {
  display: grid;
  place-content: center;
  height: var(--empty-height, 300px);
  user-select: none;
  --icon-margin: 0 auto;
  --icon-size: 72px;
  --icon-stroke: .75;
  p {
    margin: 16px 0 0;
    text-align: center;
    color: var(--color-weak);
    font-size: 14px;
    line-height: 1.15;
  }
}
</style>
