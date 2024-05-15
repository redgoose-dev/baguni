import { dateFormat } from './dates.js'

/**
 * get console resource
 * @param {string} mode
 * @return {object}
 */
function getConsoleResource(mode)
{
  switch (mode)
  {
    case 'warning':
      return { method: 'warn', prefix: '⚠️ ' }
    case 'error':
      return { method: 'error', prefix: '❌ ' }
    case 'success':
      return { method: 'log', prefix: '✅ ' }
    default:
      return { method: 'log', prefix: '🌱 ' }
  }
}

/**
 * add log
 * @param {object} log
 * @param {'error'} [log.mode]
 * @param {string} [log.message]
 */
export function addLog(log)
{
  const { mode, message } = log
  const { method, prefix } = getConsoleResource(mode)
  console.group(`[LOG START] ${dateFormat(new Date(), '{yyyy}-{MM}-{dd} {hh}:{mm}:{ss}')}`)
  console[method](prefix, message)
  console.log('[LOG END]')
  console.groupEnd()
}
