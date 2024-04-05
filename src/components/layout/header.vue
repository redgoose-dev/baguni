<template>
<header class="layout-header">
  <div class="layout-header__wrap">
    <h1 class="symbol">
      <RouterLink to="/">
        <img src="../../assets/images/symbol.svg" alt="바구니">
      </RouterLink>
    </h1>
    <nav class="menus">
      <ul>
        <li>
          <RouterLink to="/">탐색</RouterLink>
        </li>
        <li>
          <RouterLink to="/collections">콜렉션</RouterLink>
        </li>
        <li>
          <RouterLink to="/about">소개</RouterLink>
        </li>
        <li>
          <RouterLink to="/guide">개발 가이드</RouterLink>
        </li>
      </ul>
    </nav>
    <nav class="side-nav">
      <template v-if="isLogin">
        <div>
          <ButtonBasic
            href="/asset/create"
            size="small"
            color="key-1">
            등록하기
          </ButtonBasic>
        </div>
        <div>
          <Dropdown
            ref="$profileDropdown"
            v-model="openDropdownProfile"
            position="right">
            <template #trigger>
              <ButtonBasic
                size="small"
                right-icon="chevron-down"
                :color="openDropdownProfile ? 'weak' : ''">
                foo@bar.com
              </ButtonBasic>
            </template>
            <Context
              :items="[
                { key: 'account', label: '계정정보', icon: 'user' },
                { key: 'logout', label: '로그아웃', icon: 'log-out', color: 'danger' },
              ]"
              @select="onSelectProfileDropdown"/>
          </Dropdown>
        </div>
      </template>
      <template v-else>
        <div>
          <ButtonBasic
            href="/asset/create"
            size="small"
            color="key-1">
            로그인
          </ButtonBasic>
        </div>
      </template>
    </nav>
  </div>
</header>
</template>

<script setup>
import { ref } from 'vue'
import ButtonBasic from '../buttons/button-basic.vue'
import Dropdown from '../navigation/dropdown.vue'
import Context from '../navigation/context.vue'

const $profileDropdown = ref()
const isLogin = ref(true)
const openDropdownProfile = ref(false)

function onSelectProfileDropdown({ key })
{
  switch (key)
  {
    case 'account':
      break
    case 'logout':
      break
  }
  $profileDropdown.value.close()
}
</script>

<style src="./header.scss" lang="scss" scoped></style>
