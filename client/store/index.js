import { defineStore } from 'pinia'
import { ofetch } from 'ofetch'
import { apiPath, request, destroyApi, formData } from '../libs/api.js'
import { pureObject } from '../libs/objects.js'
import { STORAGE_KEYS, getStorage, setStorage } from '../libs/storage.js'

export const authStore = defineStore('auth', {
  state: () => ({
    token: '',
    account: null,
    preference: null,
    url: '',
  }),
  getters: {
    _account()
    {
      return pureObject(this.account)
    },
  },
  actions: {
    setup(op = {})
    {
      const { accessToken, account, preference, url } = op
      if (!accessToken) throw new Error('엑세스 토큰값이 없습니다.')
      if (!account) throw new Error('계정 데이터가 없습니다.')
      if (!preference) throw new Error('설정 데이터가 없습니다.')
      this.token = accessToken
      this.account = account
      this.preference = preference
      this.url = url
    },
    destroy()
    {
      console.warn('call auth.destroy()')
      destroyApi()
      this.token = ''
      this.account = null
      this.preference = null
      this.url = ''
    },
    /**
     * checkin
     * 처음 접속할때 인증검사를 하면서 계정 정보와 엑세스토큰을 가져온다.
     * @return {Promise}
     */
    async checkin()
    {
      try
      {
        if (this.token && this.account?.id) return true
        const res = await ofetch(`${apiPath}/check/`, {
          method: 'post',
          responseType: 'json',
        })
        if (!res?.data) throw new Error('no data')
        this.setup(res.data)
        return true
      }
      catch (_e)
      {
        return false
      }
    },
    async login(id, password, useSave = true)
    {
      const res = await ofetch(`${apiPath}/login/`, {
        method: 'post',
        responseType: 'json',
        body: formData({
          id,
          password,
          save: useSave ? 'true' : '',
        }),
      })
      if (!res?.data) throw new Error('로그인 응답 데이터가 없습니다.')
      this.setup(res.data)
    },
    async logout()
    {
      request('/logout/', { method: 'post' }).then()
      location.href = '/login/'
    },
    async update(op = {})
    {
      const { id, name, email, avatar } = op
      if (this.account.user_id !== id) return
      this.account.user_name = name
      this.account.user_email = email
      this.account.user_avatar = avatar
    },
  },
})

const defaultAssetsIndexFilter = {
  dateStart: undefined,
  dateEnd: undefined,
  fileType: 'all',
  order: 'id',
  sort: 'desc',
  q: undefined,
  tags: [],
  indexTheme: 'thumbnail', // list,thumbnail
  open: false,
}

export const assetStore = defineStore('asset', {
  state: () => {
    return {
      indexSize: 24,
      paginateSize: 8,
      filter: {
        ...pureObject(defaultAssetsIndexFilter),
        ...(getStorage(STORAGE_KEYS.ASSET_FILTER) || {}),
      },
    }
  },
  getters: {},
  actions: {
    resetFilter()
    {
      Object.entries(defaultAssetsIndexFilter).forEach(([ key, value ]) => {
        this.filter[key] = value
      })
      this.saveFilter()
    },
    saveFilter()
    {
      setStorage(STORAGE_KEYS.ASSET_FILTER, pureObject(this.filter))
    },
  },
})
