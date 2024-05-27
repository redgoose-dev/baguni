/**
 * [GET] /assets
 */

import { success, error } from '../output.js'
import { connect, disconnect, tables, getCount, getItem, getItems } from '../../libs/db.js'
import { checkAuthorization } from '../../libs/token.js'
import { fileTypeForAsset } from '../../libs/consts.js'
import { parseJSON } from '../../libs/objects.js'
import ServiceError from '../../libs/ServiceError.js'

export default async (req, res) => {
  try
  {
    const { q, date_start, date_end, file_type } = req.query

    // connect db
    connect({ readonly: true })
    // check auth
    checkAuthorization(req.headers.authorization)

    let index, total

    // 쿼리 만들기
    let fields = []
    let join = []
    let where = ''
    let values = {}
    if (q)
    {
      // 키워드 검색
      where += ` and (${tables.asset}.title like '%' || $q || '%' or ${tables.asset}.description like '%' || $q || '%')`
      values['$q'] = q
    }
    if (file_type)
    {
      // 파일의 타입 (image/jpeg 에서 image 부분을 필터링하자)
      fields.push(`${tables.asset}.*`)
      join.push(`join ${tables.mapAssetFile} on (${tables.asset}.id = ${tables.mapAssetFile}.asset and ${tables.mapAssetFile}.type like 'asset')`)
      join.push(`join ${tables.file} on (${tables.mapAssetFile}.file = ${tables.file}.id and ${tables.file}.type like '${file_type}%')`)
    }
    if (date_start || date_end)
    {
      // 날짜 범위
      where += ` and ($startDate is null or ${tables.asset}.regdate >= $startDate) and ($endDate is null or ${tables.asset}.regdate <= $endDate)`
      values['$startDate'] = date_start
      values['$endDate'] = date_end
    }
    where = where.trim().replace(/^and|or/, ' ')

    // TODO: order 부분 만들기 (id,title,regdate)
    // TODO: sort 부분 만들기 (asc,desc)
    // TODO: limit 부분 만들기 (페이지 번호와 사이즈를 받아 처리하기)

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
      values,
    })
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
    console.error(e)
    // close db
    disconnect()
    // result
    error(res, {
      code: e.code,
      message: '에셋을 가져오지 못했습니다.',
    })
  }
}
