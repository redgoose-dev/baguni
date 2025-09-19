/**
 * [GET] /asset/
 *
 * 에셋목록
 */

import ServiceError from '../../classes/ServiceError.js'
import { pref } from '../../classes/Preference.js'
import { getQuery } from '../../libs/server.js'
import { onRequest, onResponse, setResponse } from '../../libs/service.js'
import { connect, disconnect, tables, getCount, getItems } from '../../libs/db.js'
import { parseJSON } from '../../libs/objects.js'
import { fileTypes } from '../../libs/assets.js'
import { checkAuthorization } from '../../libs/token.js'

export default async (req, _ctx) => {

  let response

  // trigger request event
  await onRequest(req, _ctx)

  try
  {
    const { q, date_start, date_end, file_type, order, sort, page, size, tags } = getQuery(req.url)
    let fields = []
    let join = []
    let where = ''
    let values = {}
    let limit = ''

    // connect db
    connect({ readonly: true })

    // check auth
    const auth = checkAuthorization(req)

    // 키워드 검색
    if (q)
    {
      where += ` AND (${tables.asset}.title like '%' || $q || '%' OR ${tables.asset}.description like '%' || $q || '%')`
      values['$q'] = q
    }

    // 기본적인 쿼리 만들기
    fields.push(`${tables.asset}.*`)
    fields.push(`(SELECT id FROM ${tables.file} WHERE ${tables.file}.module_id = ${tables.asset}.id AND mode LIKE '${fileTypes.main}') as file_id`)
    fields.push(`(SELECT id FROM ${tables.file} WHERE ${tables.file}.module_id = ${tables.asset}.id AND mode LIKE '${fileTypes.coverCreate}') as cover_file_id`)

    // 파일의 타입 (file.type 필드에서 키워드 검색)
    if (file_type)
    {
      join.push(`JOIN ${tables.file} ON (${tables.asset}.id = ${tables.file}.module_id AND ${tables.file}.mode LIKE '${fileTypes.main}' AND ${tables.file}.type LIKE '%${file_type}%')`)
    }

    // 태그
    if (tags)
    {
      const _tags = tags.split(',').filter(Boolean).join(',')
      if (_tags)
      {
        where += `AND ${tables.asset}.id IN (select ${tables.mapAssetTag}.asset FROM ${tables.mapAssetTag} WHERE ${tables.mapAssetTag}.tag IN (${tags}))`
      }
    }

    // 날짜 범위
    if (date_start && date_end)
    {
      where += ` AND ($startDate IS NULL OR ${tables.asset}.created_at >= $startDate) AND ($endDate IS NULL OR ${tables.asset}.created_at <= $endDate)`
      values['$startDate'] = `${date_start} 00:00:00`
      values['$endDate'] = `${date_end} 23:59:59`
    }

    // repair where
    where = where.trim().replace(/^AND|OR/, ' ')

    // get total
    const total = getCount({
      table: tables.asset,
      join,
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
    values['$limit'] = (Number(size) > 0) ? Number(size) : pref.asset.pagePerCount
    values['$offset'] = (_page - 1) * values['$limit']

    // get index
    const ids = {}
    let index = getItems({
      table: tables.asset,
      prefix: 'distinct',
      fields,
      join,
      where,
      order: Boolean(order || sort) ? order : 'id',
      sort: Boolean(order || sort) ? sort : 'desc',
      limit,
      values,
    }).data
    if (index?.length > 0)
    {
      // 목록에서 데이터를 돌리면서 값을 조정한다.
      for (let i=0; i<index.length; i++)
      {
        if (index[i].json)
        {
          index[i].json = parseJSON(index[i].json)
        }
        ids[index[i].id] = i
      }
    }
    else
    {
      index = []
    }

    // set response
    response = setResponse({
      message: '에셋 데이터 목록',
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
        response = setResponse('에셋 데이터가 없습니다.', 204)
        break
      default:
        response = setResponse(new ServiceError('에셋 데이터를 가져오지 못했습니다.', {
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
