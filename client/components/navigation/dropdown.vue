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
        computedOpen && 'open',
      ]">
      <Icon :name="props.icon"/>
    </button>
  </div>
  <div
    v-if="computedOpen"
    :class="[
      'body',
      props.position && `body--${props.position}`,
    ]">
    <slot/>
  </div>
</nav>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import Icon from '../icons/index.vue'

const $root = ref()
const props = defineProps({
  position: String, // right,top-left,top-right
  icon: { type: String, default: 'more-horizontal' },
  modelValue: Boolean,
  useValue: Boolean,
})
const open = ref(false)
const emits = defineEmits([ 'update:modelValue' ])

const computedOpen = computed(() => {
  return props.useValue ? open.value : props.modelValue
})

onUnmounted(() => {
  window.removeEventListener('click', onClickWindow)
  window.removeEventListener('touchend', onClickWindow)
})

defineExpose({
  close: () => controlContext(false),
})

function onClickTrigger()
{
  controlContext(!computedOpen.value)
}

function controlContext(sw)
{
  if (sw)
  {
    window.addEventListener('click', onClickWindow)
    window.addEventListener('touchend', onClickWindow)
  }
  else
  {
    window.removeEventListener('click', onClickWindow)
    window.removeEventListener('touchend', onClickWindow)
  }
  if (props.useValue)
  {
    open.value = sw
  }
  else
  {
    emits('update:modelValue', sw)
  }
}

function onClickWindow(e)
{
  if ($root.value?.contains(e.target)) return
  controlContext(false)
}
</script>

<style src="./dropdown.scss" lang="scss" scoped></style>
