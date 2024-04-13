<template>
<header class="modal-header">
  <div class="modal-header__body">
    <h1>{{props.title}}</h1>
    <p v-if="$slots.description">
      <slot name="description"/>
    </p>
  </div>
  <div v-if="$slots.side" class="modal-header__side">
    <slot name="side"/>
  </div>
</header>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  title: { type: String, required: true },
  description: String,
})
</script>

<style lang="scss" scoped>
.modal-header {
  display: flex;
  align-items: center;
  gap: 0 30px;
  h1 {
    margin: 0;
    font-size: 28px;
    line-height: 1.05;
    font-weight: 800;
    letter-spacing: -.5px;
  }
  p {
    margin: 4px 0 0;
    line-height: 1.25;
    font-size: 12px;
    color: var(--color-weak);
  }
  &__body {
    flex: 1;
  }
  &__side {}
}
</style>
