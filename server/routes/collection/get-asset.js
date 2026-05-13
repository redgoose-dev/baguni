/**
 * [GET] /collection/:id/asset/
 *
 * 컬렉션 / 에셋 목록
 */

import ServiceError from '../../classes/ServiceError.js'
import { pref } from '../../classes/Preference.js'
import { getQuery } from '../../libs/server.js'
import { onRequest, onResponse, setResponse } from '../../libs/service.js'
import { connect, disconnect, tables, getCount, getItems } from '../../libs/db.js'
import { checkAuthorization } from '../../libs/token.js'
import { parseJSON } from '../../libs/objects.js'
import { fileTypes } from '../../libs/assets.js'

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

    const { page, size, order, sort } = getQuery(req.url)
    let index, total
    let fields = []
    let join = []
    let where = ''
    let values = {}
    let limit = ''

    // 기본적인 쿼리 만들기
    fields.push(`${tables.asset}.*`)
    fields.push(`f_main.id as file_id`)
    fields.push(`f_cover.id AS cover_file_id`)
    where = `${tables.asset}.id IN (SELECT asset FROM ${tables.mapCollectionAsset} WHERE collection = $collection)`
    values['$collection'] = id
    join = [
      `LEFT JOIN ${tables.file} f_main ON (f_main.module = '${tables.asset}' AND f_main.module_id = ${tables.asset}.id AND f_main.mode = '${fileTypes.main}')`,
      `LEFT JOIN ${tables.file} f_cover ON (f_cover.module = '${tables.asset}' AND f_cover.module_id = ${tables.asset}.id AND f_cover.mode = '${fileTypes.coverCreate}')`,
    ]

    // get total (WHERE IN으로 집계, file JOIN 불필요)
    total = getCount({
      table: tables.asset,
      where,
      values,
    }).data
    if (!total) throw new ServiceError('에셋 데이터가 없습니다.', { status: 204 })

    // set limit
    if (Number(page) > 0)
    {
      limit = `LIMIT $limit OFFSET $offset`
      values['$limit'] = (Number(size) > 0) ? Number(size) : (pref.asset.pagePerCount || 24)
      values['$offset'] = (page - 1) * values['$limit']
    }

    // get index
    index = getItems({
      table: tables.asset,
      fields,
      join,
      where,
      order,
      sort,
      limit,
      values,
    })
    index = index.data?.length > 0 ? index.data : []
    for (let i=0; i<index.length; i++)
    {
      if (index[i].json) index[i].json = parseJSON(index[i].json)
    }

    // set response
    response = setResponse({
      message: '컬렉션에 속한 에셋 데이터 목록',
      data: {
        total,
        index,
      },
    })
  }
  catch (_e)
  {
    req.err = _e
    switch (_e.status)
    {
      case 204:
        response = setResponse('에셋 데이터가 없습니다.', 204)
        break
      default:
        response = setResponse(new ServiceError('컬렉션 에셋을 가져오지 못했습니다.', {
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
