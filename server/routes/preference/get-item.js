/**
 * [GET] /preference/
 *
 * 환경설정 데이터 가져오기
 */

import ServiceError from '../../classes/ServiceError.js'
import { pref } from '../../classes/Preference.js'
import { onRequest, onResponse, setResponse } from '../../libs/service.js'
import { connect, disconnect } from '../../libs/db.js'
import { checkAuthorization } from '../../libs/token.js'

export default async (req, _ctx) => {

  let response

  // trigger request event
  await onRequest(req, _ctx)

  try
  {
    // connect db
    connect({ readonly: true })

    // check auth
    const auth = checkAuthorization(req)

    // set response
    response = setResponse({
      message: '환경설정 데이터를 가져왔습니다.',
      data: pref.output,
    })
  }
  catch (_e)
  {
    response = setResponse(new ServiceError('환경설정을 가져오지 못했습니다.', {
      status: _e.status,
      text: _e.statusText || _e.message,
      url: `${req.method} ${req.url}`,
    }))
  }
  finally
  {
    disconnect()
  }

  // trigger response event
  await onResponse(req, response, _ctx)

  return response

}
