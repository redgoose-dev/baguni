import { pref } from '../classes/Preference.js'
import { colorText } from './strings.js'
import { dateFormat } from './strings.js'

const { NODE_ENV  } = Bun.env

/**
 * is development
 * @return {boolean}
 */
export function isDev()
{
  return NODE_ENV === 'development'
}

/**
 * @param {any} serve
 */
export function openServer(serve)
{
  const assets = {
    cyan: '\x1b[36m',
    yellow: '\x1b[33m',
    reset: '\x1b[0m',
    line: Array(40).fill('=').join(''),
    development: 'Development',
    production: 'Production',
    intent: Array(2).fill(' ').join(''),
  }
  let mode = ''
  if (serve.development)
  {
    mode = colorText(`[${assets.development}]`, 'yellow')
  }
  else
  {
    mode = colorText(`[${assets.production}]`, 'blue')
  }
  console.log(assets.line)
  console.log(`${assets.intent}${colorText(pref.appName, 'green')} ${mode}`)
  console.log(`${assets.intent}➜ Local: ${colorText(`${serve.hostname}:${serve.port}`, 'cyan')}`)
  console.log(assets.line)
}

/**
 * get query from url
 *
 * @param {string} url
 * @param {string} key
 * @return {any}
 */
export function getQuery(url, key = '')
{
  const _url = new URL(url)
  const _query = _url.searchParams
  if (key)
  {
    return _query.get(key)
  }
  else
  {
    return Object.fromEntries(_query)
  }
}

/**
 * print error
 * @param {number} options.code
 * @param {string} options.message
 * @param {string} options.url
 * @param {Error|ServiceError} options.err
 */
export function printError(options = {})
{
  const { code, message, url, err } = options
  let _message = [
    dateFormat(new Date(), '{yyyy}-{MM}-{dd} {hh}:{mm}:{ss}'),
    url && url,
    message,
  ].filter(Boolean)
  console.error(`⚠️ [${code || 500}] ${_message.join(' :: ')}`)
  if (err) console.error(err)
}
