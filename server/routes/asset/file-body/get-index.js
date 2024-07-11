/**
 * [GET] /asset/:id/file-body/
 *
 * Get body files from asset
 * 에셋 상세보기 데이터 가져오기
 */

import { success, error } from '../../output.js'
import { connect, disconnect, tables, getCount, getItems } from '../../../libs/db.js'
import { checkAuthorization } from '../../../libs/token.js'
import { fileTypes } from '../../../libs/consts.js'
import { parseJSON } from '../../../libs/objects.js'
import { checkAssetOwner } from '../../../libs/service.js'
import { ownerModes } from '../../../../global/consts.js'
import ServiceError from '../../../libs/ServiceError.js'

export default async (req, res) => {
  try
  {
    const assetId = Number(req.params.id)
    if (!assetId) throw new ServiceError('에셋 id가 없습니다.', 500)

    // connect db
    connect({ readonly: true })
    // check auth
    const auth = checkAuthorization(req.headers.authorization)

    // check owner
    checkAssetOwner(ownerModes.ASSET, auth.id, assetId)

    let index, total
    let fields = []
    let join = []
    let where = ''
    let values = {}

    // 기본적인 쿼리 만들기
    fields.push(`${tables.file}.*`)
    join.push(`join ${tables.file} on (${tables.mapAssetFile}.file = ${tables.file}.id and ${tables.mapAssetFile}.type like '${fileTypes.body}')`)
    where += ` and ${tables.mapAssetFile}.asset = $id`
    values['$id'] = assetId

    // repair where
    where = where.trim().replace(/^and|or/, ' ')

    // get total
    total = getCount({
      table: tables.mapAssetFile,
      join,
      where,
      values,
    })
    if (!(total.data > 0)) throw new ServiceError('에셋 바디용 파일이 없습니다.', 204)
    // get index
    index = getItems({
      table: tables.mapAssetFile,
      fields,
      join,
      where,
      values,
    })
    if (index.data?.length > 0)
    {
      index.data = index.data.map((o) => {
        return {
          id: o.id,
          name: o.name,
          type: o.type,
          size: o.size,
          meta: parseJSON(o.meta),
        }
      })
    }

    // close db
    disconnect()
    // result
    success(req, res, {
      message: '에셋 바디용 파일목록',
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
          message: '에셋 바디용 파일이 없습니다.',
          code: 204,
        })
        break
      default:
        error(req, res, {
          code: e.code,
          message: '에셋 바디용 파일을 가져오지 못했습니다.',
          _file: __filename,
          _err: e,
        })
        break
    }
  }
}
