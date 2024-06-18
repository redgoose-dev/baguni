<template>
<article class="user">
  <PageHeader title="계정 관리하기">
    유저 계정을 관리합니다.
  </PageHeader>
  <form class="form" @submit.prevent="onSubmit">
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
              <span>{{forms.email}}</span>
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
        </ShadowBox>
      </div>
    </article>
    <article class="preference">
      <header class="preference__header">
        <h1 class="section-title">설정</h1>
        <label>
          <span>모두 편집하기</span>
          <Switch v-model="jsonEditMode" size="small"/>
        </label>
      </header>
      <ShadowBox class="preference__body">
        <div ref="$preference"></div>
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
</article>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue'
import JsonEditor from '@redgoose/json-editor'
import { authStore } from '../../store/auth.js'
import { defaultUserPreference } from '../../libs/consts.js'
import { deepMerge, pureObject } from '../../libs/objects.js'
import { success, error } from '../../libs/reactions.js'
import PageHeader from '../../components/content/page-header.vue'
import ButtonBasic from '../../components/buttons/button-basic.vue'
import InputText from '../../components/form/input-text.vue'
import Switch from '../../components/form/switch.vue'
import NavigationBottom from '../../components/navigation/bottom.vue'
import ShadowBox from '../../components/content/shadow-box.vue'
import '@redgoose/json-editor/css'

const $preference = ref()
const auth = authStore()
let jsonEditor
const forms = reactive({
  id: auth.user.id,
  email: auth.user.email,
  name: auth.user.name,
  regdate: auth.user.regdate,
  json: deepMerge(auth.user.json, defaultUserPreference),
})
const processing = ref(false)
const jsonEditMode = ref(false)

onMounted(async () => {
  // setup preference
  setupPreference()
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
  jsonEditor = new JsonEditor($preference.value, {
    live: true,
    theme: 'light',
    edit: 'value',
    openDepth: 8,
    node: forms.json,
    ...options,
  })
  const wrap = jsonEditor.el.wrap.get(0)
  wrap.addEventListener('update', ({ detail }) => {
    forms.json = detail
  })
}

async function onSubmit()
{
  if (processing.value) return
  try
  {
    processing.value = true
    await auth.update({
      name: forms.name,
      json: pureObject(forms.json),
    })
    success('계정을 업데이트했습니다.')
    processing.value = false
  }
  catch (e)
  {
    error('계정을 업데이트하지 못했습니다.', e)
    processing.value = false
  }
}
</script>

<style src="./account.scss" lang="scss" scoped></style>
