/**
 * [GET] /collections
 *
 * 콜렉션 목록
 */

import { success, error } from '../output.js'
import { connect, disconnect, tables, getCount, getItems } from '../../libs/db.js'
import { checkAuthorization } from '../../libs/token.js'
import { defaultPageSize } from '../../libs/consts.js'
import ServiceError from "../../libs/ServiceError.js";

export default async (req, res) => {
  try
  {
    const { q, order, sort, page, size } = req.query

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

    // 기본적인 쿼리 만들기
    fields.push(`${tables.collection}.*`)
    fields.push(`(select count(*) from ${tables.mapCollectionAsset} where ${tables.mapCollectionAsset}.collection = ${tables.collection}.id) as asset_count`)

    // 키워드 검색
    if (q)
    {
      where += ` and (${tables.collection}.title like '%' || $q || '%' or ${tables.collection}.description like '%' || $q || '%')`
      values['$q'] = q
    }

    // set limit
    if (Number(page) > 0)
    {
      limit = `limit $limit offset $offset`
      values['$limit'] = (Number(size) > 0) ? Number(size) : defaultPageSize
      values['$offset'] = (page - 1) * values['$limit']
    }

    // repair where
    where = where.trim().replace(/^and|or/, ' ')

    // get total
    total = getCount({
      table: tables.collection,
      join,
      where,
      values,
    })
    if (!(total.data > 0)) throw new ServiceError('콜렉션 데이터가 없습니다.', 204)

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
    if (!total.data)
    {
      index = {
        data: [],
      }
    }

    // close db
    disconnect()
    // result
    success(req, res, {
      message: '콜렉션 데이터 목록',
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
    error(req, res, {
      code: e.code,
      message: '콜렉션을 가져오지 못했습니다.',
      _file: e.code !== 204 ? __filename : undefined,
      _err: e,
    })
  }
}
