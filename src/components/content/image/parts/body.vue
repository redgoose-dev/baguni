<template>
<h3 :class="[ 'title', !props.title && 'no-title' ]">
  <router-link v-if="props.to" :to="props.to">
    {{props.title || noTitleName}}
  </router-link>
  <span v-else>
    {{props.title || noTitleName}}
  </span>
</h3>
<p v-if="props.description" class="description">
  {{props.description}}
</p>
<p v-if="props.meta?.length > 0" class="meta">
  <span v-for="keyword in props.meta">{{keyword}}</span>
</p>
</template>

<script setup>
const props = defineProps({
  to: String,
  title: String,
  description: String,
  meta: Array,
})
const noTitleName = 'Unknown title'
</script>

<style lang="scss" scoped>
@use '../../../../assets/scss/mixins';
.title {
  display: block;
  margin: 0;
  min-width: 0;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.25;
  letter-spacing: -.25px;
  border-radius: 2px;
  @include mixins.single-line-text();
  outline: 2px solid #{mixins.mix-alpha(var(--color-key-1), 0%)};
  &:has(:focus-visible) {
    outline-color: var(--color-key-1);
  }
  a {
    color: var(--color-base);
    text-decoration: none;
    outline: none;
    &:hover {
      text-decoration: underline;
    }
  }
  &.no-title {
    font-style: italic;
    &, a {
      color: var(--color-blur);
    }
  }
}
.description {
  min-width: 0;
  margin: 2px 0 0;
  font-size: 11px;
  color: var(--color-weak);
  line-height: 1.15;
  @include mixins.single-line-text();
}
.meta {
  margin: 2px 0 0;
  display: flex;
  flex-wrap: wrap;
  gap: 2px 4px;
  span {
    display: block;
    font-size: 10px;
    color: var(--color-weak);
    line-height: 1.15;
    &:not(:last-child):after {
      content: ',';
    }
  }
}
</style>
