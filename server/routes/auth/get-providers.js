/**
 * [GET] /provider/
 *
 * 프로바이더 목록
 */

import ServiceError from '../../classes/ServiceError.js'
import { onRequest, onResponse, setResponse  } from '../../libs/service.js'
import { connect, disconnect, tables, getCount, getItems } from '../../libs/db.js'
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

    // get count
    const total = getCount({
      table: tables.provider,
    }).data
    if (!total)
    {
      throw new ServiceError('프로바이더 데이터가 없습니다.', { status: 204 })
    }

    // get index
    const index = getItems({
      table: tables.provider,
    }).data

    // set response
    response = setResponse({
      message: '프로바이더 목록',
      data: {
        total,
        index: index?.length > 0 ? index.map(o => {
          return {
            provider_id: o.id,
            code: o.code,
            id: o.user_id,
            name: o.user_name,
            email: o.user_email,
            avatar: o.user_avatar,
            created_at: o.created_at,
          }
        }) : [],
      },
    })
  }
  catch (_e)
  {
    req.err = _e
    switch (_e.status)
    {
      case 204:
        response = setResponse('프로바이더 데이터가 없습니다.', 204)
        break
      default:
        response = setResponse(new ServiceError('프로바이더를 가져오지 못했습니다.', {
          status: _e.status,
          text: _e.statusText || _e.message,
          url: `${req.method} ${req.url}`,
        }))
        break
    }
  }
  finally
  {
    disconnect()
  }

  // trigger response event
  await onResponse(req, response, _ctx)

  return response

}
