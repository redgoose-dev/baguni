/**
 * [POST] /logout
 *
 * 로그아웃
 */

import ServiceError from '../../classes/ServiceError.js'
import { onRequest, onResponse, setResponse } from '../../libs/service.js'
import { connect, disconnect, tables, removeItem } from '../../libs/db.js'
import { checkAuthorization } from '../../libs/token.js'
import * as cookie from '../../libs/cookie.js'

export default async (req, _ctx) => {

  let response

  // trigger request event
  await onRequest(req, _ctx)

  try
  {
    // connect db
    connect({ readwrite: true })

    // check auth
    const auth = checkAuthorization(req)

    // remove data
    if (auth.accessToken)
    {
      removeItem({
        table: tables.tokens,
        where: 'access LIKE $access',
        values: { '$access': `%${auth.accessToken}` },
      })
    }

    // clear cookie
    cookie.remove(req, 'access')
    cookie.remove(req, 'refresh')

    // set response
    response = setResponse({
      message: '로그아웃 성공',
    })
  }
  catch (_e)
  {
    response = setResponse(new ServiceError('로그아웃 오류', {
      status: _e.status,
      text: _e.statusText || _e.message,
      url: `${req.method} ${req.url}`,
    }))
  }
  finally
  {
    // disconnect db
    disconnect()
  }

  // trigger response event
  await onResponse(req, response, _ctx)

  return response

}


