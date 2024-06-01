<template>
<dialog
  ref="$dialog"
  v-if="props.open"
  :class="[
    'modal',
    props.full ? 'modal--full' : 'modal--window',
  ]"
  @dblclick="onClickDialog"
  @keydown="onKeydown">
  <div class="modal-body">
    <slot/>
  </div>
</dialog>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'

const $dialog = ref()
const props = defineProps({
  open: Boolean,
  full: Boolean,
  useShortcut: Boolean,
  hideScroll: Boolean,
})
const emits = defineEmits([ 'close' ])

function onClickDialog(e)
{
  if (e.target !== $dialog.value) return
  closeDialog()
}

function closeDialog()
{
  emits('close')
}

function onKeydown(e)
{
  if (e.key !== 'Escape') return
  if ($dialog.value !== e.target) return e.preventDefault()
  if (!props.useShortcut) return e.preventDefault()
  closeDialog()
}

function controlRoot(sw)
{
  if (!props.hideScroll) return
  if (!sw && document.getElementById('modal').children.length > 1) return
  document.querySelector('html').classList[sw ? 'add' : 'remove']('mode-not-scroll')
}

onMounted(async () => {
  if (props.open)
  {
    controlRoot(true)
    $dialog.value.showModal()
  }
})
onUnmounted(() => {
  controlRoot(false)
})

watch(() => props.open, async (value, oldValue) => {
  if (value === oldValue) return
  if (value)
  {
    await nextTick()
    controlRoot(true)
    $dialog.value.showModal()
  }
  else
  {
    controlRoot(false)
    $dialog.value.close()
  }
})
</script>

<style src="./index.scss" lang="scss" scoped></style>
