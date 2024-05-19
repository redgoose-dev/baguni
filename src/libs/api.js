import { ofetch } from 'ofetch'
import { authStore } from '../store/auth.js'

const { VITE_URL_PATH, VITE_LOCAL_PATH_NAME } = import.meta.env
let instance
let headers

export const apiPath = `${VITE_URL_PATH || '/'}${VITE_LOCAL_PATH_NAME}`

function setup()
{
  const auth = authStore()
  instance = ofetch.create({
    baseURL: apiPath,
    retry: 0,
    responseType: 'json',
  })
  headers = {
    'Authorization': `Bearer ${auth.token}`
  }
}

/**
 * 요청 (request)
 * // TODO: 이 부분은 실제로 사용해보면서 검증하기 (아직 검증이 안되어있다.)
 * @param {string} url
 * @param {object} [options]
 * @param {?string} [options.method]
 * @param {?object} [options.query]
 * @param {?object} [options.body]
 * @param {?object} [options.headers]
 * @return {Promise<any>}
 */
export async function request(url, options = {})
{
  if (!instance) setup()
  const { method, query, body } = options
  let _options = {
    method,
    query,
    body,
  }
  _options.headers = {
    ...headers,
    ...(options.headers || {}),
  }
  let res = await instance(url, _options)
  console.warn('API RES:', res)
  return res
}
