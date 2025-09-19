<template>
<article class="login">
  <img
    src="../../assets/images/bg-login.webp"
    alt="background image"
    class="background-image">
  <span class="background-glass"/>
  <div class="login-body">
    <figure class="head-symbol">
      <img src="../../assets/images/symbol-image@2x.webp" width="68" alt="바구니">
    </figure>
    <h1 class="title">로그인</h1>
    <form class="form" @submit.prevent="onSubmit">
      <fieldset class="form-body">
        <legend>로그인 정보 입력</legend>
        <div class="field">
          <p><label for="id">아이디</label></p>
          <div>
            <InputText
              type="text"
              id="id"
              v-model="fields.id"
              placeholder="Account ID"
              :required="true"/>
          </div>
        </div>
        <div class="field">
          <p><label for="password">비밀번호</label></p>
          <div>
            <InputText
              type="password"
              id="password"
              v-model="fields.password"
              placeholder="Password"
              :required="true"/>
          </div>
        </div>
      </fieldset>
      <div class="save">
        <label>
          <Checkbox name="save" v-model="fields.save"/>
          <span>로그인 정보 저장</span>
        </label>
      </div>
      <nav class="submit">
        <Button type="submit" color="key-1" size="big">
          로그인
        </Button>
      </nav>
    </form>
  </div>
</article>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { authStore } from '../../store/index.js'
import { toast } from '../../modules/toast/index.js'
import InputText from '../../components/form/input-text.vue'
import Button from '../../components/buttons/button-basic.vue'
import Checkbox from '../../components/form/checkbox.vue'

const router = useRouter()
const auth = authStore()
const fields = reactive({
  id: '',
  password: '',
  save: true,
})

async function onSubmit()
{
  try
  {
    await auth.login(fields.id, fields.password, fields.save)
    toast.add('인증성공', 'success').then()
    await router.push('/')
  }
  catch (e)
  {
    toast.add('인증하지 못했습니다.', 'error').then()
  }
}
</script>

<style src="./login.scss" lang="scss" scoped></style>
