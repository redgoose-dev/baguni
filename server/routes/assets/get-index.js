/**
 * [GET] /assets
 *
 * 에셋목록
 */

import { success, error } from '../output.js'
import { connect, disconnect, tables, getCount, getItems } from '../../libs/db.js'
import { checkAuthorization } from '../../libs/token.js'
import { fileTypes, defaultPageSize } from '../../libs/consts.js'
import { parseJSON } from '../../libs/objects.js'
import ServiceError from '../../libs/ServiceError.js'

export default async (req, res) => {
  try
  {
    const { q, date_start, date_end, file_type, order, sort, page, size } = req.query

    // connect db
    connect({ readonly: true })
    // check auth
    checkAuthorization(req.headers.authorization)

    let index, total
    let fields = []
    let join = []
    let where = ''
    let values = {}
    let limit = ''

    // 키워드 검색
    if (q)
    {
      where += ` and (${tables.asset}.title like '%' || $q || '%' or ${tables.asset}.description like '%' || $q || '%')`
      values['$q'] = q
    }

    // 기본적인 쿼리 만들기
    fields.push(`${tables.asset}.*`)
    fields.push(`(select file from ${tables.mapAssetFile} where ${tables.mapAssetFile}.asset = ${tables.asset}.id and type like '${fileTypes.coverCreate}') as cover_file_id`)

    // 파일의 타입 (image/jpeg 에서 image 부분을 필터링하자)
    // TODO: 타입 앞 부분이 완전하지 않기 때문에 그루핑하는것이 좋을거같다.
    if (file_type)
    {
      fields.push(`${tables.asset}.*`)
      join.push(`join ${tables.mapAssetFile} on (${tables.asset}.id = ${tables.mapAssetFile}.asset and ${tables.mapAssetFile}.type like '${fileTypes.main}')`)
      join.push(`join ${tables.file} on (${tables.mapAssetFile}.file = ${tables.file}.id and ${tables.file}.type like '${file_type}%')`)
    }

    // 날짜 범위
    if (date_start && date_end)
    {
      where += ` and ($startDate is null or ${tables.asset}.regdate >= $startDate) and ($endDate is null or ${tables.asset}.regdate <= $endDate)`
      values['$startDate'] = `${date_start} 00:00:00`
      values['$endDate'] = `${date_end} 23:59:59`
    }

    // repair where
    where = where.trim().replace(/^and|or/, ' ')

    // get total
    total = getCount({
      table: tables.asset,
      join,
      where,
      values,
    })
    if (!(total.data > 0)) throw new ServiceError('에셋 데이터가 없습니다.', 204)

    // set limit
    let _page = Number(page) > 0 ? Number(page) : 1
    limit = `limit $limit offset $offset`
    values['$limit'] = (Number(size) > 0) ? Number(size) : defaultPageSize
    values['$offset'] = (_page - 1) * values['$limit']

    // get index
    const ids = {}
    index = getItems({
      table: tables.asset,
      fields,
      join,
      where,
      order: Boolean(order || sort) ? order : 'id',
      sort: Boolean(order || sort) ? sort : 'desc',
      limit,
      values,
    })
    if (index.data?.length > 0)
    {
      // 목록에서 데이터를 돌리면서 값을 조정한다.
      for (let i=0; i<index.data.length; i++)
      {
        if (index.data[i].json)
        {
          index.data[i].json = parseJSON(index.data[i].json)
        }
        ids[index.data[i].id] = i
      }
    }
    else
    {
      index = {
        data: [],
      }
    }

    // close db
    disconnect()
    // result
    success(req, res, {
      message: '에셋 데이터 목록',
      data: {
        total: total.data,
        index: index.data,
      },
    })
  }
  catch (e)
  {
    // close db
    disconnect()
    // result
    switch (e.code)
    {
      case 204:
        success(req, res, {
          message: '에셋 데이터가 없습니다.',
          code: 204,
          data: {
            total: 0,
            index: [],
          },
        })
        break
      default:
        error(req, res, {
          code: e.code,
          message: '에셋을 가져오지 못했습니다.',
          _file: __filename,
          _err: e,
        })
        break
    }
  }
}
