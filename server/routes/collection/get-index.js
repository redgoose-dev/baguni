/**
 * [GET] /collections
 *
 * 컬렉션 목록
 */

import ServiceError from '../../classes/ServiceError.js'
import { pref } from '../../classes/Preference.js'
import { getQuery } from '../../libs/server.js'
import { onRequest, onResponse, setResponse } from '../../libs/service.js'
import { connect, disconnect, tables, getCount, getItems } from '../../libs/db.js'
import { checkAuthorization } from '../../libs/token.js'
import { fileTypes } from '../../libs/assets.js'

export default async (req, _ctx) => {

  let response

  // trigger request event
  await onRequest(req, _ctx)

  try
  {
    const { q, order, sort, page, size } = getQuery(req.url)

    // connect db
    connect({ readonly: true })

    // check auth
    const auth = checkAuthorization(req)

    let index, total
    let fields = []
    let join = []
    let where = ''
    let values = {}
    let limit = ''

    // 기본적인 쿼리 만들기
    fields.push(`${tables.collection}.*`)
    fields.push(`(SELECT COUNT(*) FROM ${tables.mapCollectionAsset} WHERE ${tables.mapCollectionAsset}.collection = ${tables.collection}.id) AS asset_count`)
    fields.push(`(SELECT id FROM ${tables.file} WHERE ${tables.file}.module LIKE '${tables.collection}' AND ${tables.file}.module_id = ${tables.collection}.id AND mode LIKE '${fileTypes.coverCreate}') AS cover_file_id`)

    // 키워드 검색
    if (q)
    {
      where += ` AND (${tables.collection}.title LIKE '%' || $q || '%' OR ${tables.collection}.description LIKE '%' || $q || '%')`
      values['$q'] = q
    }

    // set limit
    if (Number(page) > 0)
    {
      limit = `LIMIT $limit offset $offset`
      values['$limit'] = (Number(size) > 0) ? Number(size) : (pref.collection.pagePerCount || 24)
      values['$offset'] = (page - 1) * values['$limit']
    }

    // repair where
    where = where.trim().replace(/^AND|OR/, ' ')

    // get total
    total = getCount({
      table: tables.collection,
      join,
      where,
      values,
    }).data
    if (!(total > 0))
    {
      throw new ServiceError('컬렉션 데이터가 없습니다.', {
        status: 204,
      })
    }

    // get index
    index = getItems({
      table: tables.collection,
      fields,
      join,
      where,
      order,
      sort,
      limit,
      values,
    })
    index = index.data
    if (!total) index = []

    // set response
    response = setResponse({
      message: '컬렉션 데이터 목록',
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
        response = setResponse('컬렉션 데이터가 없습니다.', 204)
        break
      default:
        response = setResponse(new ServiceError('컬렉션을 가져오지 못했습니다.', {
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
