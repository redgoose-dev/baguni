import { ofetch } from 'ofetch'
import { authStore } from '../store/auth.js'

const { VITE_LOCAL_PATH, VITE_LOCAL_PATH_NAME } = import.meta.env
let instance
let headers

export const apiPath = `${VITE_LOCAL_PATH || '/'}${VITE_LOCAL_PATH_NAME}`

function setup()
{
  const auth = authStore()
  instance = ofetch.create({
    baseURL: apiPath,
    retry: 0,
    responseType: 'json',
    // onResponse({ response })
    // {},
  })
  headers = {
    'Authorization': `Bearer ${auth.token}`,
  }
}

/**
 * api 인스턴스를 못쓰도록 삭제한다.
 */
export function destroyApi()
{
  instance = undefined
  headers = undefined
}

/**
 * 요청 (request)
 * @param {string} url
 * @param {object} [options]
 * @param {'get'|'post'|'put'|'delete'} [options.method]
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
  const res = await instance(url, _options)
  return res
}

/**
 * form data
 * @param {object} src
 * @return {FormData}
 */
export function formData(src)
{
  if (!src) return null
  let data = new FormData()
  Object.keys(src).forEach(o => data.append(o, src[o]))
  return data
}
