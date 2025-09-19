/**
 * [DELETE] /provider/:id/
 *
 * 프로바이더 삭제
 */

import ServiceError from '../../classes/ServiceError.js'
import { onRequest, onResponse, setResponse } from '../../libs/service.js'
import { connect, disconnect, tables, getCount, getItem, removeItem } from '../../libs/db.js'
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
    connect({ readwrite: true })

    // check auth
    const auth = checkAuthorization(req)

    // get collection data
    const provider = getItem({
      table: tables.provider,
      where: `id = ${id}`,
    }).data
    if (!provider)
    {
      throw new ServiceError('프로바이더 데이터가 없습니다.', { status: 400 })
    }

    const countProvider = getCount({
      table: tables.provider,
    }).data
    if (countProvider <= 1)
    {
      throw new ServiceError('프로바이더는 최소 1개 이상 존재해야 합니다.', { status: 400 })
    }

    // remove data
    removeItem({
      table: tables.provider,
      where: `id = ${id}`,
    })

    // set response
    response = setResponse({
      message: '프로바이더를 삭제했습니다.',
    })
  }
  catch (_e)
  {
    req.err = _e
    // set response
    response = setResponse(new ServiceError('프로바이더를 삭제하지 못했습니다.', {
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
