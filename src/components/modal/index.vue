<template>
<transition name="modal">
  <div
    ref="$dialog"
    v-if="props.open"
    tabindex="-1"
    aria-modal="true"
    role="dialog"
    :class="[
      'modal',
      props.full ? 'modal--full' : 'modal--window',
      props.animation && `animation--${props.animation}`,
    ]"
    @dblclick="onClickDialog"
    @keydown="onKeydown">
    <div class="modal-body">
      <slot/>
    </div>
  </div>
</transition>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'

const $dialog = ref()
const props = defineProps({
  open: Boolean,
  full: Boolean,
  useShortcut: Boolean,
  hideScroll: Boolean,
  animation: String, // fade,bottom-up
})
const emits = defineEmits([ 'close' ])
const open = ref(false)
const backupScrollY = ref(0)

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

async function control(sw)
{
  if (sw)
  {
    open.value = true
    await nextTick()
    $dialog.value?.focus()
  }
  else
  {
    $dialog.value?.blur()
    open.value = false
    await nextTick()
    window.scrollTo({ top: backupScrollY.value })
  }
}

function controlRoot(sw)
{
  if (!props.hideScroll) return
  if (sw) backupScrollY.value = window.scrollY
  if (!sw && document.getElementById('modal').children.length > 1) return
  document.querySelector('html').classList[sw ? 'add' : 'remove']('mode-not-scroll')
}

onMounted(async () => {
  if (props.open) controlRoot(true)
})
onUnmounted(() => {
  if (props.open) controlRoot(false)
})
watch(() => props.open, async (value, oldValue) => {
  if (value === oldValue) return
  if (value)
  {
    controlRoot(true)
    await control(true)
  }
  else
  {
    controlRoot(false)
    await control(false)
  }
})
</script>

<style src="./index.scss" lang="scss" scoped></style>
