<template>
<ShadowBox tag="section" class="item">
  <header :class="[ 'header', props.active && 'active' ]">
    <h1>
      <Icon :name="$type.icon"/>
      <strong>{{$type.label}}</strong>
    </h1>
    <nav>
      <ButtonBasic
        :href="`/account/${props.providerId}/edit/`"
        left-icon="edit"
        size="small">
        계정편집
      </ButtonBasic>
    </nav>
  </header>
  <div class="body">
    <figure>
      <img v-if="props.avatar" :src="props.avatar" alt=""/>
      <i v-else>
        <Icon name="user"/>
      </i>
    </figure>
    <div class="metas">
      <dl>
        <dt>ID</dt>
        <dd>{{props.id}}</dd>
      </dl>
      <dl>
        <dt>이름</dt>
        <dd>{{props.name}}</dd>
      </dl>
      <dl>
        <dt>이메일</dt>
        <dd>{{props.email}}</dd>
      </dl>
      <dl>
        <dt>등록일</dt>
        <dd>{{props.regdate}}</dd>
      </dl>
    </div>
  </div>
</ShadowBox>
</template>

<script setup>
import { computed } from 'vue'
import Icon from '../../../components/icons/index.vue'
import ShadowBox from '../../../components/content/shadow-box.vue'
import ButtonBasic from '../../../components/buttons/button-basic.vue'

const props = defineProps({
  providerId: Number,
  type: String,
  id: String,
  name: String,
  email: String,
  avatar: String,
  regdate: String,
  active: Boolean,
})

const $type = computed(() => {
  switch (props.type)
  {
    case 'password':
      return { label: '비밀번호', icon: 'key-round' }
    default:
      return { label: props.type, icon: 'x' }
  }
})
</script>

<style src="./index-item.scss" lang="scss" scoped></style>
