/**
 * [GET] /token/
 *
 * 토큰목록
 */

import ServiceError from '@/classes/ServiceError.js'
import { pref } from '@/classes/Preference.js'
import { getQuery } from '@/libs/server.js'
import { onRequest, onResponse, setResponse } from '@/libs/service.js'
import { connect, disconnect, tables, getCount, getItems } from '@/libs/db.js'
import { TOKEN_TYPE } from '@/libs/assets.js'
import { checkAuthorization, jwtToToken, decodeToken } from '@/libs/token.js'
import { dateFormat } from '@/libs/strings.js'

export default async (req, _ctx) => {

  let response

  // trigger request event
  await onRequest(req, _ctx)

  try
  {
    const { order, sort, page, size, q } = getQuery(req.url)
    let fields = []
    let where = ''
    let values = {}
    let limit = ''

    // connect db
    connect({ readonly: true })

    // check auth
    checkAuthorization(req)

    // 키워드 검색
    if (q)
    {
      where += ` AND (${tables.tokens}.name like '%' || $q || '%')`
      values['$q'] = q
    }

    // 기본적인 쿼리 만들기
    fields.push(`${tables.tokens}.*`)

    // get total
    const total = getCount({
      table: tables.tokens,
      where,
      values,
    }).data
    if (!(total > 0))
    {
      throw new ServiceError('에셋 데이터가 없습니다.', { status: 204 })
    }

    // set limit
    let _page = Number(page) > 0 ? Number(page) : 1
    limit = `LIMIT $limit OFFSET $offset`
    values['$limit'] = (Number(size) > 0) ? Number(size) : pref.token.pagePerCount
    values['$offset'] = (_page - 1) * values['$limit']

    // get index
    let index = getItems({
      table: tables.tokens,
      fields,
      where,
      order: Boolean(order || sort) ? order : 'id',
      sort: Boolean(order || sort) ? sort : 'desc',
      limit,
      values,
    }).data
    if (index?.length > 0)
    {
      for (let i = 0; i < index.length; i++)
      {
        const parsed = decodeToken(TOKEN_TYPE.ACCESS, index[i].access)
        index[i] = {
          id: index[i].id,
          token: jwtToToken(index[i].access),
          expired: parsed?.exp ? dateFormat(new Date(parsed.exp * 1000), '{yyyy}-{MM}-{dd} {hh}:{mm}:{ss}') : null,
          name: index[i].name,
          created_at: index[i].created_at,
        }
      }
    }

    // set response
    response = setResponse({
      message: '토큰 데이터 목록',
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
        response = setResponse('토큰 데이터가 없습니다.', 204)
        break
      default:
        response = setResponse(new ServiceError('토큰 데이터를 가져오지 못했습니다.', {
          status: _e.status,
          text: _e.statusText || _e.message,
          url: `${req.method} ${req.url}`,
          file: __filename,
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
