<template>
<article class="user">
  <div class="user__wrap">
    <PageHeader title="계정 관리하기">
      사용자 계정을 관리합니다.
    </PageHeader>
    <LoadingScreen v-if="loading"/>
    <form v-else-if="!isNaN(forms.id)" class="form" @submit.prevent="onSubmit">
      <article class="information">
        <div class="information__wrap">
          <h1 class="section-title">기본정보</h1>
          <ShadowBox class="information__body">
            <div class="field">
              <h3>아이디</h3>
              <p>
                <span>{{forms.id}}</span>
              </p>
            </div>
            <div class="field">
              <h3>이메일 주소</h3>
              <p>
                <InputText
                  v-model="forms.email"
                  placeholder="이름"
                  size="small"/>
              </p>
            </div>
            <div class="field">
              <h3>이름</h3>
              <p>
                <InputText
                  v-model="forms.name"
                  placeholder="이름"
                  size="small"/>
              </p>
            </div>
            <div class="field">
              <h3>등록일</h3>
              <p>
                <span>{{forms.regdate}}</span>
              </p>
            </div>
            <div class="field">
              <h3>비밀번호</h3>
              <p class="new-password">
                <InputText
                  v-model="forms.newPassword"
                  type="password"
                  placeholder="새로운 비밀번호"
                  size="small"
                  autocomplete="off"/>
                <InputText
                  v-model="forms.newPasswordConfirm"
                  type="password"
                  placeholder="비밀번호 확인"
                  size="small"
                  autocomplete="off"/>
              </p>
            </div>
            <div class="field">
              <h3>관리자</h3>
              <p>
                <Switch v-model="forms.admin" size="small"/>
              </p>
            </div>
          </ShadowBox>
        </div>
      </article>
      <article class="preference">
        <header class="preference__header">
          <h1 class="section-title">설정</h1>
          <label v-if="$self">
            <span>모두 편집하기</span>
            <Switch v-model="jsonEditMode" size="small"/>
          </label>
        </header>
        <ShadowBox class="preference__body">
          <div
            ref="$preference"
            :class="[ !$self && 'blur' ]"></div>
        </ShadowBox>
      </article>
      <NavigationBottom class="submit">
        <template #center>
          <ButtonBasic
            type="submit"
            :left-icon="processing ? 'loader' : 'check'"
            :rotate-icon="processing"
            size="big"
            color="key-1"
            :disabled="processing">
            {{processing ? '처리중..' : '업데이트'}}
          </ButtonBasic>
        </template>
      </NavigationBottom>
    </form>
    <EmptyContent v-else message="계정이 없습니다."/>
  </div>
</article>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import JsonEditor from '@redgoose/json-editor'
import { useRoute } from 'vue-router'
import { authStore } from '../../store/auth.js'
import { userPreference } from '../../../global/defaults.js'
import { request } from '../../libs/api.js'
import { deepMerge, pureObject } from '../../libs/objects.js'
import { success, error } from '../../libs/reactions.js'
import { userModes } from '../../../global/consts.js'
import { toast } from '../../modules/toast/index.js'
import PageHeader from '../../components/content/page-header.vue'
import ButtonBasic from '../../components/buttons/button-basic.vue'
import InputText from '../../components/form/input-text.vue'
import Switch from '../../components/form/switch.vue'
import NavigationBottom from '../../components/navigation/bottom.vue'
import ShadowBox from '../../components/content/shadow-box.vue'
import LoadingScreen from '../../components/asset/loading/screen.vue'
import EmptyContent from '../../components/content/empty-content.vue'
import '@redgoose/json-editor/css'

const $preference = ref()
const route = useRoute()
const auth = authStore()
let jsonEditor
const forms = reactive({
  id: NaN,
  email: '',
  name: '',
  newPassword: '',
  newPasswordConfirm: '',
  regdate: undefined,
  json: undefined,
  admin: false,
})
const loading = ref(false)
const processing = ref(false)
const jsonEditMode = ref(false)

const $self = computed(() => (Number(auth.user.id) === Number(route.params.id)))

onMounted(async () => {
  try
  {
    if ($self.value)
    {
      forms.id = Number(auth.user.id)
      forms.email = auth.user.email
      forms.name = auth.user.name
      forms.regdate = auth.user.regdate
      forms.json = deepMerge(userPreference, auth.user.json)
      forms.admin = auth.user.mode === userModes.ADMIN
      await nextTick()
      setupPreference()
    }
    else
    {
      loading.value = true
      const res = await request(`/user/${route.params.id}/`, {
        method: 'get'
      })
      if (!res?.data?.id) throw new Error('계정 데이터가 없습니다.')
      forms.id = Number(res.data.id)
      forms.email = res.data.email
      forms.name = res.data.name
      forms.regdate = res.data.regdate
      forms.json = deepMerge(userPreference, res.data.json)
      forms.admin = res.data.mode === userModes.ADMIN
      loading.value = false
      await nextTick()
      setupPreference({
        edit: 'none',
      })
    }
  }
  catch (e)
  {
    loading.value = false
    toast.add(e.message, 'error').then()
  }
})
onUnmounted(() => {
  if (jsonEditor)
  {
    jsonEditor.destroy()
    jsonEditor = undefined
  }
})
watch(() => jsonEditMode.value, async (value) => {
  jsonEditor.destroy()
  setupPreference({
    edit: value ? 'all' : 'value',
  })
})

function setupPreference(options = {})
{
  if ($preference.value)
  {
    jsonEditor = new JsonEditor($preference.value, {
      live: true,
      theme: 'light',
      edit: 'value',
      openDepth: 8,
      node: forms.json,
      ...options,
    })
  }
  const wrap = jsonEditor?.el?.wrap?.get(0)
  if (wrap)
  {
    wrap.addEventListener('update', ({ detail }) => {
      forms.json = detail
    })
  }
}

async function onSubmit()
{
  if (processing.value) return
  try
  {
    processing.value = true
    if ($self.value)
    {
      await auth.update({
        email: forms.email,
        name: forms.name,
        newPassword: forms.newPassword,
        newPasswordConfirm: forms.newPasswordConfirm,
        json: pureObject(forms.json),
      })
    }
    else
    {
      await request(`/user/${route.params.id}/`, {
        method: 'put',
        body: {
          email: forms.email,
          name: forms.name,
          newPassword: forms.newPassword,
          newPasswordConfirm: forms.newPasswordConfirm,
          mode: forms.admin ? userModes.ADMIN : '',
        },
      })
    }
    success('계정을 업데이트했습니다.')
    forms.newPassword = ''
    forms.newPasswordConfirm = ''
    processing.value = false
  }
  catch (e)
  {
    error('계정을 업데이트하지 못했습니다.', e)
    processing.value = false
  }
}
</script>

<style src="./detail.scss" lang="scss" scoped></style>
