<template>
<i class="loader"/>
</template>

<style lang="scss" scoped>
.loader {
  position: relative;
  display: block;
  width: var(--loader-size, 48px);
  height: var(--loader-size, 48px);
  &:after {
    content: '';
    width: 100%;
    height: 100%;
    background: var(--loader-fill, var(--color-key-3));
    animation: loader-spin var(--loader-animation-speed, 500ms) linear infinite;
    position: absolute;
    top: 0;
    left: 0;
    border-radius: 4px;
  }
  &:before {
    content: '';
    width: var(--loader-size, 48px);
    height: var(--loader-shadow-height, 5px);
    background: var(--loader-shadow-fill, hsla(0 0% 0% / 25%));
    position: absolute;
    top: calc(var(--loader-size, 48px) + var(--loader-shadow-top, 10px));
    left: 0;
    border-radius: 50%;
    animation: loader-shadow var(--loader-animation-speed, 500ms) linear infinite;
  }
}

@keyframes loader-spin {
  17% {
    border-bottom-right-radius: 3px;
  }
  25% {
    rotate: 22.5deg;
    translate: 0 9px;
  }
  50% {
    translate: 0 18px;
    rotate: 45deg;
    scale: 1 .9;
    border-bottom-right-radius: 40px;
  }
  75% {
    translate: 0 9px;
    rotate: 67.5deg;
  }
  100% {
    translate: 0 0;
    rotate: 90deg;
  }
}
@keyframes loader-shadow {
  0%, 100% {
    scale: 1 1;
  }
  50% {
    scale: 1.2 1;
  }
}
</style>
