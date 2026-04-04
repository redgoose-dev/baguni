<template>
<article class="image-cropper">
  <ModalHeader :title="props.title">
    <template #description>이미지 영역을 설정하고 커버 이미지로 만듭니다.</template>
  </ModalHeader>
  <div class="body">
    <Cropper
      ref="$cropper"
      :src="props.src"
      :stencil-size="stencilSize"
      :stencil-props="{
        aspectRatio: _ratio,
        lines: {},
        handlers: {},
        movable: false,
        resizable: false,
      }"
      :default-size="defaultSize"
      image-restriction="stencil"
      :debounce="100"
      :auto-zoom="true"
      :transitions="false"
      :resize-image="{
        adjustStencil: false,
        wheel: {
          ratio: .025,
        },
      }"
      class="cropper"
      @ready="onReady"
      @change="onChange"/>
  </div>
  <NavigationBottom class="bottom">
    <template #left>
      <div class="zoom">
        <Icon name="zoom-out"/>
        <input
          type="range"
          :value="zoom"
          :min="0"
          :max=".85"
          :step="0.01"
          @input="onChangeZoom">
        <Icon name="zoom-in"/>
      </div>
    </template>
    <template #right>
      <ButtonGroup>
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
      </ButtonGroup>
    </template>
  </NavigationBottom>
  <ModalClose @click="emits('close')"/>
</article>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { Cropper } from 'vue-advanced-cropper'
import imageResize from 'image-resize'
import { blobToFile } from '../../../libs/files.js'
import { createRandomText } from '../../../libs/strings.js'
import ModalHeader from '../../modal/header.vue'
import ModalClose from '../../modal/close.vue'
import NavigationBottom from '../../navigation/bottom.vue'
import ButtonGroup from '../../buttons/group.vue'
import ButtonBasic from '../../buttons/button-basic.vue'
import Icon from '../../icons/index.vue'
import 'vue-advanced-cropper/dist/style.css'

const $cropper = ref()
const props = defineProps({
  src: null,
  title: String,
  cropSize: Array,
  defaultCoordinates: [ Object, null ],
  submitLabel: String,
})
const emits = defineEmits([ 'close', 'submit' ])
const transitions = ref(false)
const zoom = ref(0)

const _ratio = computed(() => {
  if (props.cropSize?.length === 2) return props.cropSize[0] / props.cropSize[1]
  return 1
})

async function onReady()
{
  if (props.defaultCoordinates)
  {
    $cropper.value.setCoordinates({
      ...props.defaultCoordinates,
    })
  }
  await nextTick()
  zoom.value = getCropperZoom()
  transitions.value = true
}

function onChange()
{
  if (!$cropper.value) return
  zoom.value = getCropperZoom()
}

function stencilSize({ boundaries })
{
  return {
    width: Math.min(boundaries.height, boundaries.width) - 48,
    height: Math.min(boundaries.height, boundaries.width) - 48,
  }
}
function defaultSize({ imageSize })
{
  return {
    width: Math.min(imageSize.height, imageSize.width),
    height: Math.min(imageSize.height, imageSize.width),
  }
}

function getCropperZoom()
{
  const cropper = $cropper.value
  const { coordinates, imageSize } = cropper
  if (imageSize.width / imageSize.height > coordinates.width / coordinates.height)
  {
    return (cropper.imageSize.height - cropper.coordinates.height) / (cropper.imageSize.height - cropper.sizeRestrictions.minHeight)
  }
  else
  {
    return (cropper.imageSize.width - cropper.coordinates.width) / (cropper.imageSize.width - cropper.sizeRestrictions.minWidth)
  }
}

function onChangeZoom(e)
{
  const cropper = $cropper.value
  if (!cropper) return
  const value = Number(e.target.value)
  let z
  if (cropper.imageSize.height < cropper.imageSize.width)
  {
    const minHeight = cropper.sizeRestrictions.minHeight
    const imageHeight = cropper.imageSize.height
    z = (imageHeight - zoom.value * (imageHeight - minHeight)) / (imageHeight - value * (imageHeight - minHeight))
  }
  else
  {
    const minWidth = cropper.sizeRestrictions.minWidth
    const imageWidth = cropper.imageSize.width
    z = (imageWidth - zoom.value * (imageWidth - minWidth)) / (imageWidth - value * (imageWidth - minWidth))
  }
  cropper.zoom(z)
  zoom.value = value
}

async function onSubmit()
{
  const result = $cropper.value.getResult()
  const { coordinates, canvas } = result
  const blob = await imageResize(canvas, {
    format: 'webp',
    quality: .75,
    width: props.cropSize[0],
    height: props.cropSize[1],
    outputType: 'blob',
    reSample: 2,
    sharpen: .5,
    bgColor: '#ffffff',
  })
  const file = blobToFile(blob, `${Date.now()}-${createRandomText(4)}.webp`, 'image/webp')
  emits('submit', {
    coordinates,
    file,
  })
}
</script>

<style src="./index.scss" lang="scss" scoped></style>
