<template>
<svg
  v-if="icon"
  v-html="icon"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
  :class="[
    'icon',
    `icon--${props.name}`,
    props.animation && `icon--animation-${props.animation}`,
  ]"
  v-bind="wrapProps"/>
</template>

<script setup>
import { computed } from 'vue'
import { icons } from 'lucide'
import { toPascalCase } from '../../libs/strings.js'

const props = defineProps({
  name: String,
  color: String,
  size: String,
  stroke: Number,
  animation: String,
  animationSpeed: String,
})

const icon = computed(() => {
  let src = icons[toPascalCase(props.name)]
  if (!src) return null
  const [ tag, attrs, children ] = src
  const element = createSvgElement(tag, attrs, children)
  return element.innerHTML
})

function createSvgElement(tag, attrs, children = [])
{
  const element = document.createElementNS("http://www.w3.org/2000/svg", tag)
  Object.keys(attrs).forEach((name) => {
    element.setAttribute(name, String(attrs[name]))
  })
  if (children.length)
  {
    children.forEach((child) => {
      const childElement = createSvgElement(...child)
      element.appendChild(childElement)
    })
  }
  return element
}

const wrapProps = computed(() => {
  let attr = {
    style: {},
  }
  if (props.color) attr.style['--icon-color'] = props.color
  if (props.size) attr.style['--icon-size'] = props.size
  if (props.stroke) attr.style['--icon-stroke'] = props.stroke
  if (props.animationSpeed) attr.style['--icon-animation-speed'] = props.animationSpeed
  return attr
})
</script>

<style lang="scss" scoped>
.icon {
  display: block;
  margin: var(--icon-margin, 0);
  color: var(--icon-color, var(--color-base));
  width: var(--icon-size, 24px);
  height: var(--icon-size, 24px);
  stroke-width: var(--icon-stroke, 2);
  animation: var(--icon-animation, none);
  transition: var(--icon-transition, none);
  &--animation-rotate {
    --icon-animation: spin var(--icon-animation-speed, 2000ms) linear infinite;
  }
}
</style>
