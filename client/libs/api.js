import { ofetch } from 'ofetch'
import { authStore } from '../store/index.js'

let instance

export const apiPath = `/api`

function setup()
{
  const auth = authStore()
  instance = ofetch.create({
    baseURL: apiPath,
    retry: 0,
    responseType: 'json',
    onRequest({ options })
    {
      if (auth.token)
      {
        options.headers = {
          ...options.headers,
          'Authorization': auth.token,
        }
      }
    },
    onResponseError(ctx)
    {
      const err = new Error(ctx.response?._data?.message || 'Invalid error.')
      err.code = ctx.response.status
      ctx.error = err
    },
  })
}

/**
 * 쿼리 스트링 값 준비를 위하여 값을 정리한다.
 */
function filteringQuery(query)
{
  if (!query) return {}
  Object.entries(query).forEach(([ key, value ]) => {
    if (value === undefined)
    {
      delete query[key]
      return
    }
    query[key] = String(value)
  })
  return query
}

/**
 * api 인스턴스를 못쓰도록 삭제한다.
 */
export function destroyApi()
{
  instance = undefined
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
    query: filteringQuery(query),
    body,
  }
  _options.headers = options.headers || {}
  try
  {
    return await instance(url, _options)
  }
  catch (e)
  {
    const auth = authStore()
    if (e.status === 401 && auth.token)
    {
      auth.destroy()
      await auth.checkin()
      return await instance(url, _options)
    }
    else
    {
      throw e
    }
  }
}
