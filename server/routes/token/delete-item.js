/**
 * [DELETE] /token/
 *
 * 토큰 만료시키기 (삭제하는것보다 expired 필드를 null로 변경하여 만료시키기로 했다.)
 */

import ServiceError from '@/classes/ServiceError.js'
import { onRequest, onResponse, setResponse } from '@/libs/service.js'
import { connect, disconnect, tables, getItem, editItem } from '@/libs/db.js'
import { checkAuthorization } from '@/libs/token.js'

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
    const token = getItem({
      table: tables.tokens,
      where: `id = ${id}`,
    }).data
    if (!token)
    {
      throw new ServiceError('토큰 데이터가 없습니다.', { status: 400 })
    }

    // 로그인 아이디와 토큰 아이디가 동일하면 오류
    if (auth.id === token.id)
    {
      throw new ServiceError('동일한 토큰을 만료시킬 수 없습니다.', { status: 400 })
    }

    // expired 필드를 null로 변경하여 만료시키기
    editItem({
      table: tables.tokens,
      where: `id = ${id}`,
      set: [ 'expired = NULL' ],
      values: {},
    })

    // set response
    response = setResponse({
      message: '토큰을 만료시켰습니다.',
    })
  }
  catch (_e)
  {
    req.err = _e
    // set response
    response = setResponse(new ServiceError('토큰을 만료시키지 못했습니다.', {
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
