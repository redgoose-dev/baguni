import { ref } from 'vue'
import { defineStore } from 'pinia'
import { ofetch } from 'ofetch'
import { apiPath, request, destroyApi } from '../libs/api.js'
import { parseObject } from '../libs/objects.js'
import { assetStore } from './assets.js'

export const authStore = defineStore('auth', () => {

  const token = ref('')
  const user = ref(null)

  /**
   * 데이터 셋업
   * @param {string} _token
   * @param {object} _user
   */
  function setup(_token, _user)
  {
    if (!token) throw new Error('엑세스 토큰값이 없습니다.')
    if (!user) throw new Error('유저 데이터가 없습니다.')
    token.value = _token
    user.value = {
      ..._user,
      json: parseObject(_user.json),
    }
  }

  /**
   * 처음 접속할때 인증검사를 하면서 유저 정보와 엑세스토큰을 가져온다.
   * @return {Promise}
   */
  async function check()
  {
    try
    {
      // check store
      if (token.value && user.value?.id) return true
      // API 요청
      const res = await ofetch(`${apiPath}/check`, {
        method: 'post',
        responseType: 'json',
      })
      if (!res?.data) throw new Error('no data')
      setup(res.data.accessToken, res.data.user)
      return true
    }
    catch (e)
    {
      return false
    }
  }

  /**
   * 로그인 처리
   * @param {string} email
   * @param {string} password
   * @param {boolean} useSave
   * @return {Promise<void>}
   */
  async function login(email, password, useSave = false)
  {
    try
    {
      const res = await ofetch(`${apiPath}/login`, {
        method: 'post',
        responseType: 'json',
        body: {
          email,
          password,
          save: useSave ? 'true' : undefined,
        },
      })
      if (!res) throw new Error('응답 데이터가 없습니다.')
      setup(res.data?.accessToken, res.data?.user)
    }
    catch (e)
    {
      throw e
    }
  }

  /**
   * 로그아웃 처리
   * @return {Promise<void>}
   */
  async function logout()
  {
    await request('/logout', {
      method: 'post',
    })
    token.value = ''
    user.value = null
    destroyApi()
  }

  /**
   * 정보 업데이트
   * @param {object} value
   * @return {Promise<void>}
   */
  async function update(value)
  {
    const { name, json } = value
    await request(`/user/${user.value.id}/`, {
      method: 'put',
      body: {
        name,
        json: JSON.stringify(json),
      },
    })
    user.value.name = name
    user.value.json = json
    const assets = assetStore()
    assets.updateAll()
  }

  return {
    token,
    user,
    setup,
    check,
    login,
    logout,
    update,
  }
})
