/**
 * [GET] /provider/:id/
 *
 * Get provider data
 */

import ServiceError from '../../classes/ServiceError.js'
import { onRequest, onResponse, setResponse  } from '../../libs/service.js'
import { connect, disconnect, tables, getItem } from '../../libs/db.js'
import { checkAuthorization } from '../../libs/token.js'

export default async (req, _ctx) => {

  let response

  // trigger request event
  await onRequest(req, _ctx)

  try
  {
    const id = Number(req.params.id)
    if (!id) throw new ServiceError('ID 값이 없습니다.', { status: 204 })

    // connect db
    connect({ readonly: true })

    // check auth
    const auth = checkAuthorization(req)

    // get data
    const provider = getItem({
      table: tables.provider,
      where: `id = ${id}`,
    }).data
    if (!provider)
    {
      throw new ServiceError('프로바이더 데이터가 없습니다.', { status: 204 })
    }

    // set response
    response = setResponse({
      message: '프로바이더 정보',
      data: {
        provider_id: provider.id,
        code: provider.code,
        id: provider.user_id,
        name: provider.user_name,
        email: provider.user_email,
        avatar: provider.user_avatar,
        created_at: provider.created_at,
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
        response = setResponse(new ServiceError('프로바이더 정보를 가져오지 못했습니다.', {
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
