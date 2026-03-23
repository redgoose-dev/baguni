<template>
<article class="create-token">
  <PageHeader title="토큰 만들기">
    새로운 엑세스 토큰을 만듭니다.
  </PageHeader>
  <form class="post" @submit.prevent="onSubmit">
    <fieldset>
      <legend>새로운 토큰정보 입력</legend>
      <div class="field">
        <p><label for="token-name" class="label">이름</label></p>
        <div>
          <InputText
            id="token-name"
            name="token-name"
            v-model="forms.name"
            placeholder="토큰을 설명하는 내용"
            :maxlength="50"/>
        </div>
      </div>
      <div class="field">
        <p><label for="token-expire-in" class="label">만료기간</label></p>
        <div>
          <FormGroup class="expire-in">
            <InputText
              type="number"
              name="token-expire-in"
              id="token-expire-in"
              v-model="forms.expValue"
              :min="1"
              :max="999"
              :step="1"
              placeholder="수치"/>
            <template #right>
              <Select
                name="token-expire-in-unit"
                v-model="forms.expUnit"
                :options="[
                  { label: '분', value: 'm' },
                  { label: '시', value: 'h' },
                  { label: '일', value: 'd' },
                  { label: '년', value: 'y' },
                ]"
                placeholder=""
                class="expire-in__unit"/>
            </template>
          </FormGroup>
        </div>
      </div>
    </fieldset>
    <NavigationBottom class="submit">
      <template #center>
        <ButtonBasic
          type="submit"
          left-icon="check"
          color="key-1"
          title="토큰 만들기">
          만들기
        </ButtonBasic>
      </template>
    </NavigationBottom>
  </form>
  <ModalClose @click="emits('close')"/>
</article>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import { request, formData } from '../../../libs/api.js'
import { error, success } from '../../../libs/reactions.js'
import PageHeader from '../../../components/content/page-header.vue'
import ModalClose from '../../../components/modal/close.vue'
import FormGroup from '../../../components/form/group.vue'
import InputText from '../../../components/form/input-text.vue'
import Select from '../../../components/form/select.vue'
import NavigationBottom from '../../../components/navigation/bottom.vue'
import ButtonBasic from '../../../components/buttons/button-basic.vue'

const emits = defineEmits([ 'submit', 'close' ])
const data = reactive({
  processing: false,
})
const forms = reactive({
  name: '',
  expValue: 7,
  expUnit: 'd', // m(분), h(시간), d(일), y(년)
})

async function onSubmit()
{
  try
  {
    await request('/token/', {
      method: 'put',
      body: formData({
        name: forms.name || '',
        expires: `${forms.expValue}${forms.expUnit}`,
      }),
    })
    success('토큰을 만들었습니다.')
    emits('submit')
    emits('close')
  }
  catch (_e)
  {
    error('토큰을 만들지 못했습니다.', _e)
  }
}
</script>

<style src="./create-token.scss" lang="scss" scoped></style>
