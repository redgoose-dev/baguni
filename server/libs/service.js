import ServiceError from '../classes/ServiceError.js'
import { pref } from '../classes/Preference.js'
import { colorText, dateFormat } from './strings.js'
import { printError } from './server.js'

/**
 * on request
 * @param {Request} req
 * @param {DebugHTTPServer} _ctx
 */
export async function onRequest(req, _ctx)
{
  // check installed
  if (!pref.installed)
  {
    // 인스톨이 안되어있는 상태기 때문에 검사해본다.
    if (await pref.checkInstall())
    {
      // 인스톨 파일이 존재해서 pref 셋업한다.
      await pref.setup()
    }
    else
    {
      throw new ServiceError('Not installed service.', {
        status: 503,
        url: req.url,
        file: __filename,
      })
    }
  }
  const _url = new URL(req.url)
  const date = dateFormat(new Date(), '{yyyy}-{MM}-{dd} {hh}:{mm}:{ss}')
  const method = colorText(req.method, 'cyan')
  const url = colorText(_url.pathname, 'blue')
  console.log(`🪴 [${date}] ${method} ${url}`)
}

/**
 * on response
 * @param {Request} req
 * @param {Response} res
 * @param {DebugHTTPServer} _ctx
 */
export async function onResponse(req, res, _ctx)
{
  if (!res.ok && _ctx.development)
  {
    const content = await res.text()
    printError({
      code: res?.status || 500,
      message: res?.statusText || content || 'Unknown Error',
      url: `${req.method} ${req.url}`,
      err: req.err,
    })
  }
}

/**
 * set response
 *
 * @param {object|ServiceError|string} content
 * @param {number} status
 * @param {object} options
 * @returns {Response}
 */
export function setResponse(content, status = 200, options = {})
{
  let _options = {
    ...options,
    status,
  }
  if (content instanceof ServiceError)
  {
    _options.status = content.status
    _options.statusText = content.statusText
    return new Response(content.message || 'Internal Server Error', _options)
  }
  else if (content instanceof ArrayBuffer || content instanceof Uint8Array)
  {
    return new Response(content, _options)
  }
  else if (typeof content === 'object')
  {
    return Response.json(content, _options)
  }
  else
  {
    return new Response(content, _options)
  }
}

/**
 * get form data
 * @param {Request} req
 * @return {Promise<object>}
 */
export async function getFormData(req)
{
  const data = await req.formData()
  return Object.fromEntries(data)
}

/**
 * check FormData
 * @param {object} formData
 * @param {string[]} keys
 * @return {string}
 */
export function checkFormData(formData, keys = [])
{
  if (!keys?.length) return ''
  if (!formData)
  {
    throw new Error('No form data.')
  }
  for (const key of keys)
  {
    const value = formData[key]
    if (value === null || value === undefined) return key
  }
  return ''
}

/**
 * checking file
 * 파일인지 아닌지 검사한다.
 * @param {string} path
 * @return {boolean}
 */
export function checkingFile(path)
{
  const fileRegex = /\.[a-zA-Z0-9]{1,10}$/
  return fileRegex.test(path)
}

export function checkingIgnorePath(ignorePaths = [], path)
{
  return ignorePaths.some(s => {
    return path.startsWith(s)
  })
}
