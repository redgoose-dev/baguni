<template>
<article class="login">
  <img
    src="https://goose.redgoose.me/data/upload/original/202306/on-the-clouds-006.webp"
    alt=""
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
          <p><label for="email">이메일 주소</label></p>
          <div>
            <InputText
              type="email"
              id="email"
              placeholder="goose@servername.com"/>
          </div>
        </div>
        <div class="field">
          <p><label for="password">비밀번호</label></p>
          <div>
            <InputText
              type="password"
              id="password"
              placeholder="password"/>
          </div>
        </div>
      </fieldset>
      <div class="save">
        <label>
          <Checkbox name="save"/>
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
import InputText from '../../components/form/input-text.vue'
import Button from '../../components/buttons/button-basic.vue'
import Checkbox from '../../components/form/checkbox.vue'

function onSubmit()
{
  console.log('onSubmit()')
}
</script>

<style src="./login.scss" lang="scss" scoped></style>
