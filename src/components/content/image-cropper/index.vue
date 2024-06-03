<template>
<article class="image-cropper">
  <ModalHeader :title="props.title">
    <template #description>이미지 영역을 설정하고 커버 이미지로 만듭니다.</template>
    <template #side>
      <ModalButtonClose @close="emits('close')"/>
    </template>
  </ModalHeader>
  <div class="body">
    <Cropper
      ref="_cropper"
      :src="props.src"
      :stencil-props="{
        aspectRatio: $ratio,
        handlers: {},
        movable: false,
        resizable: false,
      }"
      image-restriction="stencil"
      :debounce="100"
      :auto-zoom="true"
      :transitions="transitions"
      class="cropper"
      @ready="onReady"/>
  </div>
  <NavigationBottom class="bottom">
    <template #center>
      <ButtonBasic
        color="weak"
        @click="emits('close')">
        닫기
      </ButtonBasic>
      <ButtonBasic
        color="key-1"
        @click="onSubmit">
        {{props.submitLabel}}
      </ButtonBasic>
    </template>
  </NavigationBottom>
</article>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Cropper } from 'vue-advanced-cropper'
import ImageResize from 'image-resize'
import ModalHeader from '../../modal/header.vue'
import ModalButtonClose from '../../modal/button-close.vue'
import NavigationBottom from '../../navigation/bottom.vue'
import ButtonBasic from '../../buttons/button-basic.vue'
import 'vue-advanced-cropper/dist/style.css'

const _cropper = ref()
const props = defineProps({
  src: null,
  title: String,
  cropSize: Array,
  defaultCoordinates: [ Object, null ],
  submitLabel: String,
})
const emits = defineEmits([ 'close', 'submit' ])
const imageResize = new ImageResize({
  format: 'webp',
  quality: .72,
  width: props.cropSize[0],
  height: props.cropSize[1],
  outputType: 'blob',
  reSample: 2,
  sharpen: .5,
})
const transitions = ref(false)

const $ratio = computed(() => {
  if (props.cropSize?.length === 2) return props.cropSize[0] / props.cropSize[1]
  return 1
})

function onReady()
{
  if (props.defaultCoordinates)
  {
    _cropper.value.setCoordinates({
      ...props.defaultCoordinates,
    })
  }
  transitions.value = true
}

async function onSubmit()
{
  const result = _cropper.value.getResult()
  const { coordinates, canvas } = result
  emits('submit', {
    coordinates,
    blob: await imageResize.play(canvas.toDataURL()),
  })
}
</script>

<style src="./index.scss" lang="scss" scoped></style>
