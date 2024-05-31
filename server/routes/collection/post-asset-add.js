/**
 * [POST] /collection/asset
 *
 * Add asset in collection
 */

import { success, error } from '../output.js'
import { connect, disconnect, tables, addItem, getCount } from '../../libs/db.js'
import { checkAuthorization } from '../../libs/token.js'
import ServiceError from '../../libs/ServiceError.js'

export default async (req, res) => {
  try
  {
    const id = Number(req.params.id)
    const asset = Number(req.body.asset)

    // check collection id
    if (!id) throw new ServiceError('컬렉션 id 값이 없습니다.')

    // check asset id
    if (!asset) throw new ServiceError('에셋 id 값이 없습니다.')

    // connect db
    connect({ readwrite: true })
    // check auth
    checkAuthorization(req.headers.authorization)

    // check collection data
    const collectionCount = getCount({
      table: tables.collection,
      where: 'id = $id',
      values: { '$id': id },
    })
    if (!collectionCount.data) throw new ServiceError('컬렉션 데이터가 없습니다.')

    // check asset data
    const assetCount = getCount({
      table: tables.asset,
      where: 'id = $id',
      values: { '$id': asset },
    })
    if (!assetCount.data) throw new ServiceError('에셋 데이터가 없습니다.')

    // check exist data from collection map
    const collectionMapCount = getCount({
      table: tables.mapCollectionAsset,
      where: 'collection = $collection and asset = $asset',
      values: {
        '$collection': id,
        '$asset': asset,
      },
    })
    if (collectionMapCount.data > 0) throw new ServiceError('이미 에셋이 추가되어 있습니다.')

    // add asset id in collection map
    const mapId = addItem({
      table: tables.mapCollectionAsset,
      values: [
        { key: 'collection', value: id },
        { key: 'asset', value: asset },
      ].filter(Boolean),
    })

    // close db
    disconnect()
    // result
    success(req, res, {
      message: '컬렉션에 에셋을 추가했습니다.',
      data: {
        mapCollectionAsset: mapId.data,
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
      message: '에셋을 컬렉션에 추가하지 못했습니다.',
      _file: __filename,
      _err: e,
    })
  }
}
