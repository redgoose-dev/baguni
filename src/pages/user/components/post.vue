<template>
<form class="form" @submit.prevent="onSubmit">
  <fieldset class="fields">
    <legend>계정정보 입력 폼</legend>
    <div class="field">
      <h3><label for="email">이메일 주소</label></h3>
      <div>
        <InputText
          v-model="forms.email"
          type="email"
          name="email"
          id="email"
          autocomplete="off"
          placeholder="이메일 주소를 입력해주세요."
          :required="true"
          :maxlength="56"
          style="--input-text-wdith: 280px"/>
      </div>
    </div>
    <div class="field">
      <h3><label for="name">이름</label></h3>
      <div>
        <InputText
          v-model="forms.name"
          name="name"
          id="name"
          autocomplete="off"
          placeholder="이름을 입력해주세요."
          :required="true"
          :maxlength="36"
          style="--input-text-wdith: 200px"/>
      </div>
    </div>
    <div class="field">
      <h3><label for="password">비밀번호</label></h3>
      <div class="passwords">
        <InputText
          v-model="forms.password"
          type="password"
          name="password"
          id="password"
          autocomplete="off"
          placeholder="비밀번호"
          :required="true"
          :maxlength="24"/>
        <InputText
          v-model="forms.rePassword"
          type="password"
          autocomplete="off"
          placeholder="비밀번호 확인"
          :required="true"
          :maxlength="24"/>
      </div>
    </div>
    <div class="field">
      <h3><label for="admin">관리자</label></h3>
      <div class="admin">
        <Switch
          v-model="forms.admin"
          name="admin"
          id="admin"/>
        <p>이 계정을 관리자로 사용합니다.</p>
      </div>
    </div>
  </fieldset>
  <NavigationBottom class="bottom-nav">
    <template #left>
      <ButtonBasic
        type="submit"
        color="key-1"
        :disabled="props.processing"
        :rotate-icon="props.processing"
        :left-icon="props.processing ? 'loader' : 'user-round'">
        {{$submitLabel}}
      </ButtonBasic>
    </template>
  </NavigationBottom>
</form>
</template>

<script setup>
import { reactive, computed } from 'vue'
import { userModes } from '../../../../global/consts.js'
import { toast } from '../../../modules/toast/index.js'
import { verifyEmail } from '../../../../global/strings.js'
import InputText from '../../../components/form/input-text.vue'
import Switch from '../../../components/form/switch.vue'
import NavigationBottom from '../../../components/navigation/bottom.vue'
import ButtonBasic from '../../../components/buttons/button-basic.vue'
import Button from "../../../components/buttons/button-basic.vue";

const props = defineProps({
  data: Object,
  processing: Boolean,
})
const emits = defineEmits([ 'submit' ])
const forms = reactive({
  email: props.data?.email || '',
  name: props.data?.name || '',
  password: '',
  rePassword: '',
  admin: props.data?.mode === userModes.ADMIN,
})

const $isEdit = computed(() => (!!props.data))
const $submitLabel = computed(() => {
  if (props.processing) return '처리중'
  return $isEdit.value ? '계정 수정하기' : '계정 만들기'
})

function onSubmit()
{
  try
  {
    // check email
    if (!verifyEmail(forms.email))
    {
      throw new Error('이메일 주소를 확인해주세요.')
    }
    // check password
    if (forms.password !== forms.rePassword)
    {
      throw new Error('확인용 비밀번호가 서로 다릅니다.')
    }
    const body = {
      email: forms.email,
      name: forms.name,
      password: forms.password,
      mode: forms.admin ? userModes.ADMIN : undefined,
    }
    emits('submit', body)
  }
  catch (e)
  {
    toast.add(e.message, 'error').then()
  }
}
</script>

<style src="./post.scss" lang="scss" scoped></style>
