<template>
<footer class="layout-footer">
  <div class="layout-footer__wrap">
    <p class="copyright">@2024 redgoose</p>
  </div>
</footer>
</template>

<script setup>
</script>

<style lang="scss" scoped>
.layout-footer {
  padding: 0 0 24px;
  &__wrap {
    display: grid;
    max-width: var(--size-content-width);
    margin: 0 auto;
    box-sizing: border-box;
  }
}
.copyright {
  justify-self: end;
  margin: 0;
  font-size: 11px;
  font-weight: 500;
  line-height: 1.15;
  //color: var(--color-weak);
  user-select: none;
}
</style>
