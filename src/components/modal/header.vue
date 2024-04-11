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
  h1 {
    margin: 0;
  }
  p {
    margin: 0;
  }
  &__body {}
  &__side {}
}
</style>
