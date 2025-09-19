/**
 * [GET] /asset/:id/file-body/
 *
 * Get body files from asset
 * 에셋 바디용 파일 데이터 가져오기
 */

import ServiceError from '../../../classes/ServiceError.js'
import { getQuery } from '../../../libs/server.js'
import { onRequest, onResponse, setResponse } from '../../../libs/service.js'
import { connect, disconnect, tables, getCount, getItems } from '../../../libs/db.js'
import { checkAuthorization } from '../../../libs/token.js'
import { fileTypes } from '../../../libs/assets.js'
import { parseJSON } from '../../../libs/objects.js'

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

    const { file_type, order, sort } = getQuery(req.url)
    let index, total
    let fields = []
    let join = []
    let where = ''
    let values = {}

    // 기본적인 쿼리 만들기
    where += ` AND module LIKE '${tables.asset}'`
    where += ` AND module_id = ${id}`
    where += ` AND mode LIKE '${fileTypes.body}'`

    // 파일의 타입 (type 필드에서 키워드 검색)
    if (file_type) where += ` AND type LIKE '%${file_type}%'`

    // repair where
    where = where.trim().replace(/^AND|OR/, ' ')

    // get total
    total = getCount({
      table: tables.file,
      join,
      where,
      values,
    }).data
    if (!(total > 0))
    {
      throw new ServiceError('에셋 바디용 파일이 없습니다.', {
        status: 204,
      })
    }

    // get index
    index = getItems({
      table: tables.file,
      fields,
      join,
      where,
      order: Boolean(order || sort) ? order : 'id',
      sort: Boolean(order || sort) ? sort : 'desc',
      values,
    }).data
    if (index?.length > 0)
    {
      index = index.map((o) => ({
        id: o.id,
        name: o.name,
        type: o.type,
        size: o.size,
        meta: parseJSON(o.meta),
      }))
    }

    // set response
    response = setResponse({
      message: '에셋 바디용 파일목록',
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
        response = setResponse('에셋 바디용 파일이 없습니다.', 204)
        break
      default:
        response = setResponse(new ServiceError('에셋 바디용 파일을 가져오지 못했습니다.', {
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
