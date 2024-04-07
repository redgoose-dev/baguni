<template>
<component :is="tag" v-bind="wrapProps">
  <Body :is-label="!!$slots.default" v-bind="bodyProps">
    <slot v-if="$slots.default"/>
  </Body>
</component>
</template>

<script setup>
import { computed } from 'vue'
import Body from './body.vue'

const props = defineProps({
  type: String, // button,submit,reset,text
  href: String,
  target: String,
  title: String,
  disabled: Boolean,
  size: String, // small,big
  color: String, // key-1,key-2,key-3,success,danger,dark,weak,blur
  icon: String,
  leftIcon: String,
  rightIcon: String,
  rotateIcon: Boolean,
  theme: String, // circle
})

const type = computed(() => {
  if (props.href) return /^http/.test(props.href) ? 'a' : 'router'
  else return props.type || 'button'
})
const tag = computed(() => {
  switch (type.value)
  {
    case 'a': return 'a'
    case 'router': return 'router-link'
    case 'text': return 'p'
    default: return 'button'
  }
})
const wrapProps = computed(() => {
  let attr = {}
  attr.class = [ 'button' ]
  if (props.title) attr.title = props.title
  switch (type.value)
  {
    case 'a':
      attr.href = props.href || '#'
      if (props.target) attr.target = props.target
      break
    case 'router':
      attr.to = props.href || '#'
      if (props.disabled) attr.class.push('disabled')
      if (props.target) attr.target = props.target
      break
    case 'text':
      attr.class.push('button--text')
      if (props.disabled) attr.class.push('disabled')
      break
    default:
      attr.type = props.type || 'button'
      if (props.disabled) attr.disabled = props.disabled
      break
  }
  if (props.size) attr.class.push(`button--${props.size}`)
  if (props.color) attr.class.push(`button--${props.color}`)
  if (props.theme) attr.class.push(`button--${props.theme}`)
  if (props.icon) attr.class.push(`button--icon`)
  return attr
})
const bodyProps = computed(() => {
  return {
    icon: props.icon,
    leftIcon: props.leftIcon,
    rightIcon: props.rightIcon,
    rotateIcon: props.rotateIcon,
  }
})
</script>

<style src="./button-basic.scss" lang="scss" scoped></style>
