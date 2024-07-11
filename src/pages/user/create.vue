<template>
<article class="create-user">
  <h1>.create-user</h1>
</article>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue'
import { authStore } from '../../store/auth.js'
import { userModes } from '../../../global/consts.js'
import AppError from '../../modules/AppError.js'

const auth = authStore()

// check admin
if (auth.user.mode !== userModes.ADMIN)
{
  throw new AppError('관리자만 접근할 수 있습니다.', 403)
}
</script>
