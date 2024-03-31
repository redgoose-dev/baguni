<template>
<nav ref="$root" class="context-dropdown">
  <div
    role="button"
    class="trigger"
    @click="onClickTrigger">
    <slot v-if="$slots.trigger" name="trigger"/>
    <button
      v-else
      type="button"
      :class="[
        'trigger-button',
        open && 'open',
      ]">
      <IconFeather :name="props.icon"/>
    </button>
  </div>
  <div
    v-if="open"
    :class="[
      'body',
      props.position && `body--${props.position}`,
    ]">
    <slot/>
  </div>
</nav>
</template>

<script setup>
import { ref } from 'vue'
import IconFeather from '../icons/feather.vue'

const $root = ref()
const props = defineProps({
  position: String, // right
  icon: { type: String, default: 'more-horizontal' },
})
const emits = defineEmits([ 'update' ])
const open = ref(false)

function onClickTrigger()
{
  controlContext(!open.value)
}

function controlContext(sw)
{
  if (sw)
  {
    window.addEventListener('click', onClickWindow)
    open.value = true
  }
  else
  {
    window.removeEventListener('click', onClickWindow)
    open.value = false
  }
  emits('update', open.value)
}

function onClickWindow(e)
{
  if ($root.value.contains(e.target)) return
  controlContext(false)
}

defineExpose({
  close: () => controlContext(false),
})
</script>

<style src="./context-dropdown.scss" lang="scss" scoped></style>
