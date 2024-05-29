/**
 * [DELETE] /collection/:id/asset/:asset/
 *
 * Remove asset in collection
 */

import { success, error } from '../output.js'
import { connect, disconnect, tables, getCount, removeItem } from '../../libs/db.js'
import { checkAuthorization } from '../../libs/token.js'
import { addLog } from '../../libs/log.js'
import ServiceError from '../../libs/ServiceError.js'

export default async (req, res) => {
  try
  {
    const id = Number(req.params.id)
    const asset = Number(req.params.asset)

    if (!id) throw new ServiceError('콜렉션 id 값이 없습니다.')
    if (!asset) throw new ServiceError('에셋 id 값이 없습니다.')

    // connect db
    connect({ readwrite: true })
    // check auth
    checkAuthorization(req.headers.authorization)

    // check exist asset and collection from map table
    const mapCount = getCount({
      table: tables.mapCollectionAsset,
      where: 'collection = $collection and asset = $asset',
      values: {
        '$collection': id,
        '$asset': asset,
      },
    })
    if (!mapCount.data) throw new ServiceError('콜렉션/에셋 맵 테이블에서 데이터가 없습니다.')

    // remove data from map table
    removeItem({
      table: tables.mapCollectionAsset,
      where: 'collection = $collection and asset = $asset',
      values: {
        '$collection': id,
        '$asset': asset,
      },
    })

    // close db
    disconnect()
    // result
    success(res, { message: '에셋을 콜렉션에서 제거했습니다.' })
  }
  catch (e)
  {
    // add log
    addLog({ mode: 'error', message: e.message })
    // close db
    disconnect()
    // result
    error(res, {
      code: e.code,
      message: '에셋을 콜렉션에 제거하지 못했습니다.',
    })
  }
}
