/**
 * [PATCH] /preference/
 *
 * 환경설정 데이터 업데이트
 */

import ServiceError from '@/classes/ServiceError.js'
import { pref } from '@/classes/Preference.js'
import { onRequest, onResponse, setResponse } from '@/libs/service.js'
import { checkAuthorization } from '@/libs/token.js'

export default async (req, _ctx) => {

  let response

  // trigger request event
  await onRequest(req, _ctx)

  try
  {
    // get body
    const preference = await req.json()
    if (!preference)
    {
      throw new ServiceError('환경설정 데이터가 없습니다.', { status: 400 })
    }

    // check auth
    const auth = checkAuthorization(req)

    // update
    await pref.update(preference)

    // set response
    response = setResponse({
      message: '환경설정 데이터를 수정했습니다.',
    })
  }
  catch (_e)
  {
    response = setResponse(new ServiceError('환경설정을 수정하지 못했습니다.', {
      status: _e.status,
      text: _e.statusText || _e.message,
      url: `${req.method} ${req.url}`,
    }))
  }

  // trigger response event
  await onResponse(req, response, _ctx)

  return response

}
