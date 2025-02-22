<template>
<header class="layout-header">
  <div class="layout-header__wrap">
    <h1 class="symbol">
      <RouterLink
        to="/"
        :class="[ $activeMenuItem === 'asset' && 'on' ]">
        <img src="../../assets/images/symbol.svg" alt="바구니">
      </RouterLink>
    </h1>
    <nav class="menus">
      <ul>
        <li>
          <RouterLink
            to="/"
            role="button"
            :class="[ $activeMenuItem === 'asset' && 'on' ]">
            탐색
          </RouterLink>
        </li>
        <li>
          <RouterLink
            to="/collections"
            :class="[ $activeMenuItem === 'collection' && 'on' ]">
            컬렉션
          </RouterLink>
        </li>
        <li>
          <RouterLink
            to="/about"
            :class="[ $activeMenuItem === 'about' && 'on' ]">
            소개
          </RouterLink>
        </li>
        <li v-if="$useGuide">
          <RouterLink
            to="/guide"
            :class="[ $activeMenuItem === 'guide' && 'on' ]">
            개발 가이드
          </RouterLink>
        </li>
      </ul>
    </nav>
    <nav class="side-nav">
      <template v-if="$isLogin">
        <div>
          <ButtonBasic
            href="/asset/create/"
            size="small"
            left-icon="upload"
            color="key-1">
            에셋 만들기
          </ButtonBasic>
        </div>
        <div>
          <Dropdown
            ref="$profileDropdown"
            v-model="openDropdownProfile"
            position="right"
            class="profile">
            <template #trigger>
              <ButtonBasic
                size="small"
                right-icon="chevron-down"
                :color="openDropdownProfile ? 'weak' : ''">
                {{auth.user.email}}
              </ButtonBasic>
            </template>
            <Context
              :items="[
                { key: 'account', label: '계정 관리하기', icon: 'user-round-cog' },
                $admin && { key: 'add-user', label: '계정 만들기', icon: 'user-round-plus' },
                { key: 'logout', label: '로그아웃', icon: 'log-out', color: 'danger' },
              ].filter(Boolean)"
              @select="onSelectProfileDropdown"/>
          </Dropdown>
        </div>
      </template>
      <template v-else>
        <div>
          <ButtonBasic href="/login" size="small" color="key-1">
            로그인
          </ButtonBasic>
        </div>
      </template>
    </nav>
  </div>
</header>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { authStore } from '../../store/auth.js'
import { userModes } from '../../../global/consts.js'
import ButtonBasic from '../buttons/button-basic.vue'
import Dropdown from '../navigation/dropdown.vue'
import Context from '../navigation/context.vue'

const { DEV } = import.meta.env
const route = useRoute()
const router = useRouter()
const auth = authStore()
const $profileDropdown = ref()
const openDropdownProfile = ref(false)

const $isLogin = computed(() => (!!auth.user))
const $activeMenuItem = computed(() => {
  return route.meta?.active
})
const $useGuide = computed(() => {
  return DEV
})
const $admin = computed(() => {
  return auth.user.mode === userModes.ADMIN
})

function onSelectProfileDropdown({ key })
{
  switch (key)
  {
    case 'account':
      router.push(`/user/${auth.user.id}/`)
      break
    case 'add-user':
      router.push('/user/create/')
      break
    case 'logout':
      if (!confirm('정말로 로그아웃 할까요?')) return
      auth.logout().then(() => router.replace('/login'))
      break
  }
  $profileDropdown.value.close()
}
</script>

<style src="./header.scss" lang="scss" scoped></style>
