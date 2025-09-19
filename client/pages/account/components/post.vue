<template>
<form class="form" @submit.prevent="onSubmit">
  <fieldset class="fields">
    <legend>계정정보 입력 폼</legend>
    <div class="field">
      <h3><label for="id">계정 아이디</label></h3>
      <div>
        <InputText
          v-model="forms.id"
          name="id"
          id="id"
          placeholder="영어, 숫자, '-', '_' 입력"
          :readonly="$isEdit"
          :required="true"
          :maxlength="24"
          style="--input-text-wdith: 200px"/>
        <p>영어, 숫자, '-', '_' 입력할 수 있습니다.</p>
      </div>
    </div>
    <div class="field">
      <h3><label for="name">이름</label></h3>
      <div>
        <InputText
          v-model="forms.name"
          name="name"
          id="name"
          placeholder="이름을 입력해주세요."
          :required="true"
          :maxlength="36"
          style="--input-text-wdith: 300px"/>
      </div>
    </div>
    <div class="field">
      <h3><label for="email">이메일 주소</label></h3>
      <div>
        <InputText
          v-model="forms.email"
          type="email"
          name="email"
          id="email"
          placeholder="이메일 주소를 입력해주세요."
          :required="true"
          :maxlength="64"
          style="--input-text-wdith: 360px"/>
      </div>
    </div>
    <div class="field">
      <h3><label for="avatar">프로필 이미지</label></h3>
      <div>
        <InputText
          v-model="forms.avatar"
          type="url"
          name="avatar"
          id="avatar"
          placeholder="https://.../image.jpg"/>
        <p>이미지 URL 주소를 입력해주세요.</p>
      </div>
    </div>
    <div v-if="!$isEdit" class="field">
      <h3><label for="password">비밀번호</label></h3>
      <div class="passwords">
        <InputText
          v-model="forms.password"
          type="password"
          name="password"
          id="password"
          placeholder="비밀번호"
          :required="true"
          :maxlength="24"
          style="--input-text-wdith: 240px"/>
        <InputText
          v-model="forms.confirmPassword"
          type="password"
          placeholder="비밀번호 재입력"
          :required="true"
          :maxlength="24"
          style="--input-text-wdith: 240px"/>
      </div>
    </div>
  </fieldset>
  <NavigationBottom class="bottom-nav">
    <template #left>
      <ButtonBasic
        type="submit"
        color="key-1"
        size="big"
        :disabled="props.processing"
        :rotate-icon="props.processing"
        :left-icon="props.processing ? 'loader' : 'check'">
        {{$submitLabel}}
      </ButtonBasic>
    </template>
  </NavigationBottom>
</form>
</template>

<script setup>
import { reactive, computed } from 'vue'
import { toast } from '../../../modules/toast/index.js'
import InputText from '../../../components/form/input-text.vue'
import NavigationBottom from '../../../components/navigation/bottom.vue'
import ButtonBasic from '../../../components/buttons/button-basic.vue'

const props = defineProps({
  data: Object,
  processing: Boolean,
})
const emits = defineEmits([ 'submit' ])
const forms = reactive({
  id: props.data?.id || '',
  name: props.data?.name || '',
  email: props.data?.email || '',
  avatar: props.data?.avatar || '',
  password: '',
  confirmPassword: '',
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
    if (forms.password !== forms.confirmPassword)
    {
      throw new Error('확인용 비밀번호가 서로 다릅니다.')
    }
    const body = {
      id: forms.id,
      name: forms.name,
      email: forms.email,
      avatar: forms.avatar,
      password: forms.password,
    }
    emits('submit', body)
  }
  catch (_e)
  {
    toast.add(_e.message, 'error').then()
  }
}
</script>

<style src="./post.scss" lang="scss" scoped></style>
