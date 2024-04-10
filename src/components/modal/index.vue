<template>
<dialog
  ref="$dialog"
  :class="[
    'modal',
    props.full ? 'modal--full' : 'modal--window',
  ]"
  @click="onClickDialog"
  @keydown="onKeydown">
  <div class="modal-body">
    <slot/>
  </div>
</dialog>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'

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

onMounted(() => {
  if (props.open) $dialog.value.showModal()
})

watch(() => props.open, (value, oldValue) => {
  if (value === oldValue) return
  if (value) $dialog.value.showModal()
  else $dialog.value.close()
})
</script>

<style src="./index.scss" lang="scss" scoped></style>
