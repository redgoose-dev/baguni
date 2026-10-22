import { expect, test } from 'bun:test'
import { createPinia, setActivePinia } from 'pinia'
import { authStore, assetStore } from '../client/store/index.js'

test('Pinia 업데이트 후 인증 상태와 에셋 필터 기본값을 유지한다', () => {
  setActivePinia(createPinia())
  const auth = authStore()
  auth.setup({ accessToken: 'test-token', account: { id: 1, user_id: 'test' }, preference: { asset: { pagePerCount: 12, pageRange: 5 } }, url: 'http://localhost' })
  expect(auth._account.id).toBe(1)
  expect(assetStore().indexSize).toBe(12)
  expect(assetStore().paginateSize).toBe(5)
  auth.update({ id: 'test', name: 'Updated' })
  expect(auth.account.user_name).toBe('Updated')
  auth.destroy()
  expect(auth.token).toBe('')
  expect(auth.account).toBeNull()
})
