/**
 * [GET] /assets
 */

import { success, error } from '../output.js'
import { connect, disconnect, tables, getCount, getItem, getItems } from '../../libs/db.js'
import { checkAuthorization } from '../../libs/token.js'
import { fileTypeForAsset, defaultPageSize } from '../../libs/consts.js'
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

    let index, total, err

    // 쿼리 만들기
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

    // 파일의 타입 (image/jpeg 에서 image 부분을 필터링하자)
    if (file_type)
    {
      fields.push(`${tables.asset}.*`)
      join.push(`join ${tables.mapAssetFile} on (${tables.asset}.id = ${tables.mapAssetFile}.asset and ${tables.mapAssetFile}.type like 'asset')`)
      join.push(`join ${tables.file} on (${tables.mapAssetFile}.file = ${tables.file}.id and ${tables.file}.type like '${file_type}%')`)
    }

    // 날짜 범위
    if (date_start || date_end)
    {
      where += ` and ($startDate is null or ${tables.asset}.regdate >= $startDate) and ($endDate is null or ${tables.asset}.regdate <= $endDate)`
      values['$startDate'] = date_start
      values['$endDate'] = date_end
    }
    where = where.trim().replace(/^and|or/, ' ')

    // set limit
    if (Number(page) > 0)
    {
      limit = `limit $limit offset $offset`
      values['$limit'] = (Number(size) > 0) ? Number(size) : defaultPageSize
      values['$offset'] = (page - 1) * values['$limit']
    }

    // get total
    total = getCount({
      table: tables.asset,
      join,
      where,
      values,
    })

    // get index
    const ids = {}
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

    if (!(index.data?.length > 0))
    {
      throw new ServiceError('데이터가 없습니다.', 204)
    }

    // 목록에서 데이터를 돌리면서 값을 조정한다.
    for (let i=0; i<index.data.length; i++)
    {
      if (index.data[i].json)
      {
        index.data[i].json = parseJSON(index.data[i].json)
      }
      ids[index.data[i].id] = i
    }
    // 커버 이미지 아이디값을 가져와서 붙여준다.
    if (Object.keys(ids)?.length > 0)
    {
      const mapAssetFile = getItems({
        table: tables.mapAssetFile,
        fields: [ 'asset', 'file' ],
        where: `asset in (${Object.keys(ids).join(',')}) and type like '${fileTypeForAsset.assetCoverCreate}'`,
      })
      mapAssetFile.data.forEach(o => {
        const idx = ids[o.asset]
        if (index.data[idx])
        {
          index.data[idx].cover_file_id = o.file
        }
      })
    }

    // close db
    disconnect()
    // result
    success(res, {
      message: '에셋의 상세정보',
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
    error(res, {
      code: e.code,
      message: '에셋을 가져오지 못했습니다.',
    })
  }
}
