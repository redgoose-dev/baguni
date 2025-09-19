import ServiceError from '../../classes/ServiceError.js'
import { pref } from '../../classes/Preference.js'
import { setResponse } from '../../libs/service.js'
import { printError } from '../../libs/server.js'

/**
 * 서비스 오류
 * @example
 * ```
 * throw new ServiceError('인증 실패', {
 *   status: 500,
 *   text: '디테일한 메시지',
 *   url: POST http://localhost/assets/,
 *   file: __filename,
 * })
 * ```
 */
export default function error(err)
{
  // print error
  if (pref.server.development)
  {
    printError({
      code: err.status,
      message: err.statusText || err.message,
      url: err.url || undefined,
      err,
    })
  }

  // return response
  if (err instanceof ServiceError)
  {
    return setResponse(err)
  }
  else
  {
    return setResponse(new ServiceError('Internal Server Error', {
      status: 500,
      text: err?.message || err,
      err,
    }))
  }
}
