<template>
<dialog
  ref="$root"
  v-if="open"
  class="lightbox"
  @click="onClose"
  @keydown="onKeydown">
  <figure>
    <img :src="props.src" :alt="props.title" draggable="false"/>
  </figure>
  <nav class="close">
    <button
      type="button"
      title="Close"
      @click.stop="onClose">
      <Icon name="x"/>
    </button>
  </nav>
</dialog>
</template>

<script setup>
import { ref, watch, nextTick, onUnmounted } from 'vue'
import Icon from '../../icons/index.vue'

const props = defineProps({
  src: String,
  title: String,
  useShortcut: { type: Boolean, default: true },
})
const emits = defineEmits([ 'close' ])
const $root = ref()
const open = ref(false)

watch(() => !!props.src, control)
onUnmounted(() => control(false))

async function control(sw)
{
  if (sw)
  {
    open.value = true
    await nextTick()
    $root.value.showModal()
    controlRoot(true)
  }
  else
  {
    if ($root.value) $root.value.close()
    open.value = false
    controlRoot(false)
  }
}

function onKeydown(e)
{
  if (e.key !== 'Escape') return
  if ($root.value !== e.target) return e.preventDefault()
  if (!props.useShortcut) return e.preventDefault()
  onClose()
}

function controlRoot(sw)
{
  if (!sw && document.getElementById('modal').children.length > 1) return
  document.querySelector('html').classList[sw ? 'add' : 'remove']('mode-not-scroll')
}

function onClose()
{
  emits('close')
}
</script>

<style src="./index.scss" lang="scss" scoped></style>
