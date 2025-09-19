/**
 * [GET] /tag/
 *
 * 태그목록
 */

import ServiceError from '../../classes/ServiceError.js'
import { getQuery } from '../../libs/server.js'
import { onRequest, onResponse, setResponse } from '../../libs/service.js'
import { connect, disconnect, tables, getCount, getItems } from '../../libs/db.js'
import { checkAuthorization } from '../../libs/token.js'

export default async (req, _ctx) => {

  let response

  // trigger request event
  await onRequest(req, _ctx)

  try
  {
    const { q } = getQuery(req.url)

    // connect db
    connect({ readonly: true })

    // check auth
    const auth = checkAuthorization(req)

    let index, total
    let where = ''
    let values = {}

    // 이름 검색
    if (q)
    {
      where += `name LIKE '%' || $q || '%'`
      values['$q'] = q
    }

    // get total
    total = getCount({
      table: tables.tag,
      where,
      values,
    }).data
    if (!(total > 0))
    {
      throw new ServiceError('태그 데이터가 없습니다.', { status: 204 })
    }

    // get index
    index = getItems({
      table: tables.tag,
      where,
      values,
    }).data
    if (!(index?.length > 0)) index = []

    // set response
    response = setResponse({
      message: '태그 데이터 목록',
      data: {
        total,
        index,
      },
    })
  }
  catch (_e)
  {
    switch (_e.status)
    {
      case 204:
        response = setResponse('태그 데이터가 없습니다.', 204)
        break
      default:
        response = setResponse(new ServiceError('태그를 가져오지 못했습니다.', {
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
