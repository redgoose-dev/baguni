<template>
<header class="header">
  <h1 class="title">
    <RouterLink to="/guide">
      <small>Development guide</small>
      <strong>개발 가이드</strong>
    </RouterLink>
  </h1>
  <nav class="menus">
    <details open>
      <summary>
        <span>Asset</span>
      </summary>
      <ul>
        <li><RouterLink to="/guide/asset/colors">colors</RouterLink></li>
        <li><RouterLink to="/guide/asset/icons">icons</RouterLink></li>
      </ul>
    </details>

    <details open>
      <summary>
        <span>Content</span>
      </summary>
      <ul>
        <li><RouterLink to="/guide/asset/modal">modal</RouterLink></li>
      </ul>
    </details>

    <details open>
      <summary>
        <span>Form</span>
      </summary>
      <ul>
        <li><RouterLink to="/guide/forms/input-text">input-text</RouterLink></li>
        <li><RouterLink to="/guide/forms/select">select</RouterLink></li>
        <li><RouterLink to="/guide/forms/checkbox-and-radio">checkbox & radio</RouterLink></li>
        <li><RouterLink to="/guide/forms/switch">switch</RouterLink></li>
        <li><RouterLink to="/guide/forms/tag">tag</RouterLink></li>
      </ul>
    </details>
    <details open>
      <summary>
        <span>Navigation</span>
      </summary>
      <ul>
        <li><RouterLink to="/guide/navigation/button">button</RouterLink></li>
        <li><RouterLink to="/guide/navigation/context">context</RouterLink></li>
        <li><RouterLink to="/guide/navigation/dropdown">dropdown</RouterLink></li>
      </ul>
    </details>
  </nav>
</header>
</template>

<script setup>
import {} from 'vue-router'
</script>

<style src="./header.scss" lang="scss" scoped></style>
