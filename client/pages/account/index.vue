<template>
<article class="accounts">
  <div class="accounts__wrap">
    <PageHeader title="계정">
      계정 데이터를 관리합니다.
    </PageHeader>
    <div class="accounts__body">
      <LoadingScreen v-if="state.loading"/>
      <template v-else>
        <p class="index-message">총 <strong>{{state.total}}</strong>개의 계정 데이터가 있습니다.</p>
        <div v-if="$index.length > 0" class="index">
          <Item v-for="o in $index" v-bind="o"/>
        </div>
      </template>
    </div>
  </div>
</article>
</template>

<script setup>
import { reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { authStore } from '../../store/index.js'
import { request } from '../../libs/api.js'
import { dateFormat } from '../../libs/dates.js'
import PageHeader from '../../components/content/page-header.vue'
import LoadingScreen from '../../components/asset/loading/screen.vue'
import Item from './components/index-item.vue'

const router = useRouter()
const route = useRoute()
const auth = authStore()
const state = reactive({
  loading : true,
  total: 0,
  index: [],
})

const $index = computed(() => {
  return state.index.map(o => {
    return {
      providerId: o.provider_id,
      type: o.code,
      id: o.id,
      name: o.name,
      email: o.email,
      avatar: o.avatar,
      regdate: dateFormat(new Date(o.created_at), '{yyyy}-{MM}-{dd}'),
      active: auth.account.user_id === o.id,
    }
  })
})

onMounted(async () => {
  const res = await request('/provider/')
  state.total = res.data?.total || 0
  state.index = res.data?.index || []
  state.loading = false
})
</script>

<style src="./index.scss" lang="scss" scoped></style>
