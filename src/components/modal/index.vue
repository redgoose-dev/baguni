<template>
<dialog
  ref="$dialog"
  :class="[
    'modal',
    props.full ? 'modal--full' : 'modal--window',
  ]"
  @click="onClickDialog">
  <div :class="[
    'modal-body',
    props.full ? 'modal-body--full' : 'modal-body--window',
  ]">
    <slot/>
    <button
      v-if="!props.full"
      type="button"
      class="modal-close"
      @click="controlDialog(false)">
      <IconFeather name="x"/>
    </button>
  </div>
</dialog>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import IconFeather from '../icons/feather.vue'

const $dialog = ref()
const props = defineProps({
  open: Boolean,
  full: Boolean,
  useShortcut: Boolean,
})
const emits = defineEmits([ 'close' ])

function onClickDialog(e)
{
  if (e.target !== $dialog.value) return
  controlDialog(false)
}

function controlDialog(sw)
{
  if (sw)
  {
    window.addEventListener('keydown', onKeydownWindow)
    $dialog.value.showModal()
  }
  else
  {
    window.removeEventListener('keydown', onKeydownWindow)
    $dialog.value.close()
    emits('close')
  }
}

function onKeydownWindow(e)
{
  if (e.key !== 'Escape') return
  if (!props.useShortcut) return e.preventDefault()
  controlDialog(false)
}

onMounted(() => {
  if (props.open) $dialog.value.showModal()
})
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydownWindow)
})

watch(() => props.open, (value, oldValue) => {
  if (value === oldValue) return
  if (value) controlDialog(true)
  else controlDialog(false)
})
</script>

<style src="./index.scss" lang="scss" scoped></style>
