/**
 * [GET] /collection/:id/assets/
 *
 * 컬렉션 / 에셋목록
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
    const { order, sort, page, size } = req.query
    const id = Number(req.params.id)

    if (!id) throw new ServiceError('컬렉션 id 값이 없습니다.', 204)

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
    fields.push(`${tables.asset}.*`)
    join.push(`join ${tables.mapCollectionAsset} on ${tables.asset}.id = ${tables.mapCollectionAsset}.asset and ${tables.mapCollectionAsset}.collection = $collection`)
    values['$collection'] = id

    // get total
    total = getCount({
      table: tables.asset,
      join,
      where,
      values,
    })
    if (!total.data) throw new ServiceError('에셋 데이터가 없습니다.', 204)

    // set limit
    if (Number(page) > 0)
    {
      limit = `limit $limit offset $offset`
      values['$limit'] = (Number(size) > 0) ? Number(size) : defaultPageSize
      values['$offset'] = (page - 1) * values['$limit']
    }

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
      throw new ServiceError('에셋 데이터가 없습니다.', 204)
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
        where: `asset in (${Object.keys(ids).join(',')}) and type like '${fileTypes.coverCreate}'`,
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
    success(req, res, {
      message: '컬렉션에 속한 에셋 데이터 목록',
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
      message: '컬렉션 에셋을 가져오지 못했습니다.',
      _file: e.code !== 204 ? __filename : undefined,
      _err: e,
    })
  }
}
