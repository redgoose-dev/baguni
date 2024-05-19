import { dateFormat } from './dates.js'

/**
 * is development
 * @return {boolean}
 */
export function isDev()
{
  return import.meta.env.NODE_ENV === 'development'
}

/**
 * open server message
 * @param {string} host
 * @param {number} port
 * @param {boolean} isDev
 */
export function openServerMessage(host, port, isDev)
{
  const assets = {
    cyan: '\x1b[36m',
    yellow: '\x1b[33m',
    reset: '\x1b[0m',
    line: Array(40).fill('=').join(''),
    development: 'Development',
    production: 'Production',
  }
  const colorText = (message, color) => (`${assets[color]}${message}${assets.reset}`)
  console.log(assets.line)
  console.log(`| ${colorText(isDev ? assets.development : assets.production, 'yellow')} server running at:`)
  console.log(`| >> Local: ${colorText(`http://localhost:${port}`, 'cyan')}`)
  console.log(assets.line)
}

/**
 * 업로드용 패스 만들기
 * @param {string} prefix
 */
export function getUploadPathName(prefix = '')
{
  let path = '/' + prefix
  path += '/' + dateFormat(new Date(), '{yyyy}-{MM}')
  path = path.replace(/\/\//gi, '/')
  return path
}
