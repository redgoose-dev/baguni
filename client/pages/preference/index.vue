<template>
<article class="preference">
  <div class="wrap">
    <PageHeader title="환경설정">
      서비스의 환경설정을 편집합니다. 데이터 구조에 주의해주세요.
    </PageHeader>
    <LoadingScreen v-if="state.loading"/>
    <ShadowBox v-else class="body">
      <div ref="$jsonEditor"></div>
    </ShadowBox>
    <nav class="submit">
      <ButtonGroup size="big">
        <ButtonBasic
          size="big"
          left-icon="undo-2"
          @click="onClickReset">
          되돌리기
        </ButtonBasic>
        <ButtonBasic
          size="big"
          color="key-1"
          :disabled="state.processing"
          :rotate-icon="state.processing"
          :left-icon="state.processing ? 'loader' : 'check'"
          @click="onClickSave">
          {{state.processing ? '저장중..' : '저장하기'}}
        </ButtonBasic>
      </ButtonGroup>
    </nav>
  </div>
</article>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import JsonEditor from '@redgoose/json-editor'
import { authStore } from '../../store/index.js'
import { error, success } from '../../libs/reactions.js'
import { request } from '../../libs/api.js'
import AppError from '../../modules/AppError.js'
import PageHeader from '../../components/content/page-header.vue'
import LoadingScreen from '../../components/asset/loading/screen.vue'
import ShadowBox from '../../components/content/shadow-box.vue'
import ButtonBasic from '../../components/buttons/button-basic.vue'
import ButtonGroup from '../../components/buttons/group.vue'
import '@redgoose/json-editor/css'

const auth = authStore()
const $jsonEditor = ref()
const state = reactive({
  loading: true,
  processing: false,
  data: null,
  backup: null,
})
let jsonEditor

onMounted(async () => {
  state.loading = true
  const res = await request('/preference/')
  if (!res.data) throw new AppError('환경설정 데이터를 가져오지 못했습니다.', 204)
  state.data = res.data
  state.backup = Object.assign({}, res.data)
  state.loading = false
  await nextTick()
  initJsonEditor()
})
onUnmounted(() => {
  if (jsonEditor)
  {
    jsonEditor.destroy()
    jsonEditor = undefined
  }
})

async function onClickSave()
{
  try
  {
    state.processing = true
    await request('/preference/', {
      method: 'patch',
      body: state.data,
    })
    auth.preference = Object.assign({}, state.data)
    success('환경설정을 수정했습니다.')
  }
  catch (_e)
  {
    error('환경설정을 수정하지 못했습니다.', _e)
  }
  finally
  {
    state.processing = false
  }
}

async function onClickReset()
{
  if (!confirm('처음 불러온 모습으로 되돌립니다. 되돌릴까요?')) return
  jsonEditor.destroy()
  initJsonEditor()
}

function initJsonEditor()
{
  jsonEditor = new JsonEditor($jsonEditor.value, {
    live: true,
    theme: 'light',
    edit: 'all',
    openDepth: 8,
    node: state.data,
  })
  const el = jsonEditor?.el?.wrap?.get(0)
  if (!el) return
  el.addEventListener('update', ({ detail }) => {
    state.data = detail
  })
}
</script>

<style src="./index.scss" lang="scss" scoped></style>
