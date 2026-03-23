<template>
<div class="card">
  <h3 class="id">{{props.id}}</h3>
  <div class="body">
    <p v-if="props.name" class="name">{{props.name}}</p>
    <FormGroup size="small" class="token">
      <InputText
        name="token"
        :model-value="props.token"
        size="small"
        :readonly="true"
        :disabled="!_expired"/>
      <template v-if="_expired" #right>
        <ButtonBasic
          title="복사하기"
          color="key-1"
          size="small"
          icon="copy"
          @click="copyClipboardToken"/>
      </template>
    </FormGroup>
    <dl class="date">
      <dt>생성일</dt>
      <dd>{{_createdAtFormat}}</dd>
      <template v-if="_expired">
        <dt>만료일</dt>
        <dd><strong>{{_expiredFormat}}</strong></dd>
      </template>
    </dl>
  </div>
  <aside class="side">
    <Tag v-if="_used" label="사용중" :fill="true" color="key-3"/>
    <Tag v-else-if="!_expired" label="만료" :fill="false" color="weak"/>
    <ButtonBasic
      v-else
      type="button"
      left-icon="trash-2"
      size="small"
      color="danger"
      @click="emits('expire-token', props.id)">
      만료
    </ButtonBasic>
  </aside>
</div>
</template>

<script setup>
import { computed } from 'vue'
import { authStore } from '../../../store/index.js'
import { dateFormat } from '../../../libs/dates.js'
import { toast } from '../../../modules/toast/index.js'
import FormGroup from '../../../components/form/group.vue'
import InputText from '../../../components/form/input-text.vue'
import ButtonBasic from '../../../components/buttons/button-basic.vue'
import Tag from '../../../components/form/tag.vue'

const auth = authStore()
const props = defineProps({
  id: Number,
  token: String,
  expired: String,
  name: String,
  createdAt: String,
})
const emits = defineEmits([ 'expire-token' ])

const _expired = computed(() => (!!props.expired))
const _used = computed(() => (auth.token === props.token))
const _createdAtFormat = computed(() => {
  return dateFormat(new Date(props.createdAt), '{yyyy}. {MM}. {dd}.')
})
const _expiredFormat = computed(() => {
  return dateFormat(new Date(props.expired), '{yyyy}. {MM}. {dd}. {hh}:{mm}:{ss}')
})

async function copyClipboardToken()
{
  await navigator.clipboard.writeText(props.token)
  toast.add('토큰을 복사했습니다.', 'success').then()
}
</script>

<style src="./card.scss" lang="scss" scoped></style>
