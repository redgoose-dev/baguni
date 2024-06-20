/**
 * [GET] /tags
 *
 * 태그목록
 */

import { success, error } from '../output.js'
import { connect, disconnect, tables, getCount, getItems } from '../../libs/db.js'
import { checkAuthorization } from '../../libs/token.js'
import ServiceError from '../../libs/ServiceError.js'

export default async (req, res) => {
  try
  {
    const { q } = req.query

    // connect db
    connect({ readonly: true })
    // check auth
    checkAuthorization(req.headers.authorization)

    let index, total
    let where = ''
    let values = {}

    // 이름 검색
    if (q)
    {
      where += `name like '%' || $q || '%'`
      values['$q'] = q
    }

    // get total
    total = getCount({
      table: tables.tag,
      where,
      values,
    })
    if (!(total.data > 0)) throw new ServiceError('태그 데이터가 없습니다.', 204)

    // get index
    index = getItems({
      table: tables.tag,
      where,
      values,
    })
    if (!(index.data?.length > 0))
    {
      index = {
        data: [],
      }
    }

    // close db
    disconnect()
    // result
    success(req, res, {
      message: '태그 데이터 목록',
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
          message: '태그 데이터가 없습니다.',
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
          message: '태그를 가져오지 못했습니다.',
          _file: __filename,
          _err: e,
        })
        break
    }
  }
}
