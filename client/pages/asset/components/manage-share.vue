<template>
<article class="share">
  <ModalHeader title="에셋 공유하기">
    <template #description>에셋 데이터를 외부에 공개하여 공유할 수 있습니다.</template>
  </ModalHeader>
  <LoadingScreen v-if="data.loading" class="loading"/>
  <template v-else>
    <fieldset class="address">
      <legend>에셋공유 주소</legend>
      <FormGroup>
        <InputText
          :model-value="$address"
          type="search"
          placeholder="https://"
          :readonly="true"
          @click="onClickAddress"/>
        <template #right>
          <Select
            v-model="data.mode"
            placeholder=""
            :options="[
              { value: 'private', label: '비공개' },
              { value: 'public', label: '공개' },
            ]"
            class="permission"
            @update:modelValue="onChangeMode"/>
        </template>
      </FormGroup>
      <p>
        에셋이 외부에 공개되길 원치않으면 꼭 비공개로 바꿔주세요.
      </p>
    </fieldset>
    <NavigationBottom class="bottom">
      <template #left>
        <ButtonGroup>
          <ButtonBasic
            left-icon="copy"
            color="key-1"
            title="공유주소 복사"
            @click="copyClipboard">
            주소복사
          </ButtonBasic>
          <ButtonBasic
            icon="external-link"
            color="key-2"
            title="공유주소 열기"
            @click="openAddress">
            열기
          </ButtonBasic>
        </ButtonGroup>
      </template>
    </NavigationBottom>
  </template>
  <ModalClose @click="emits('close')"/>
</article>
</template>

<script setup>
import { reactive, computed, onMounted } from 'vue'
import { authStore } from '../../../store/index.js'
import { request, formData } from '../../../libs/api.js'
import { toast } from '../../../modules/toast/index.js'
import { success, error } from '../../../libs/reactions.js'
import ModalHeader from '../../../components/modal/header.vue'
import ModalClose from '../../../components/modal/close.vue'
import FormGroup from '../../../components/form/group.vue'
import ButtonGroup from '../../../components/buttons/group.vue'
import InputText from '../../../components/form/input-text.vue'
import ButtonBasic from '../../../components/buttons/button-basic.vue'
import NavigationBottom from '../../../components/navigation/bottom.vue'
import Select from '../../../components/form/select.vue'
import LoadingScreen from '../../../components/asset/loading/screen.vue'

const props = defineProps({
  assetId: Number,
})
const emits = defineEmits([ 'close' ])
const auth = authStore()
const data = reactive({
  loading: false,
  code: '',
  mode: '',
})

const $address = computed(() => {
  return `${auth.url}/share/${data.code}/`
})

onMounted(async () => {
  try
  {
    if (!props.assetId) throw new Error('에셋 아이디가 없습니다.')
    data.loading = true
    const res = await request(`/asset/${props.assetId}/share/`, {
      method: 'put',
    })
    if (!res?.data) throw new Error('공유 데이터가 없습니다.')
    data.code = res.data.code
    data.mode = res.data.mode
    data.loading = false
  }
  catch (e)
  {
    data.loading = false
    error('에셋 공유를 열 수 없습니다.', e)
    emits('close')
  }
})

async function onChangeMode()
{
  try
  {
    await request(`/asset/${props.assetId}/`, {
      method: 'patch',
      body: formData({ mode: data.mode }),
    })
    success('공유의 상태를 수정했습니다.')
  }
  catch (e)
  {
    error('공유의 상태를 수정하지 못했습니다.', e)
  }
}

function onClickAddress(e)
{
  e.target.select()
}

async function copyClipboard()
{
  if (!$address.value) return
  await navigator.clipboard.writeText($address.value)
  toast.add('공유주소를 클립보드에 복사했습니다.', 'success')
}

function openAddress()
{
  if (!$address.value) return
  window.open($address.value)
}
</script>

<style src="./manage-share.scss" lang="scss" scoped></style>
