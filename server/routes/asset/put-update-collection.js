/**
 * [PUT] /asset/:id/collections/
 *
 * 콜렉션에 에셋담기 업데이트
 */

import { success, error } from '../output.js'
import { connect, disconnect, tables, getItems, removeItem, getCount, addItems } from '../../libs/db.js'
import { checkAuthorization } from '../../libs/token.js'
import { compareArrays } from '../../libs/objects.js'
import ServiceError from '../../libs/ServiceError.js'

export default async (req, res) => {
  try
  {
    // check id
    const id = Number(req.params.id)
    if (!id) throw new ServiceError('id 값이 없습니다.')
    // check collections
    let collections = req.body.collections
    if (collections === undefined) throw new ServiceError('콜렉션 아이디가 없습니다.', 500)

    // set collections
    collections = collections.split(',').filter(Boolean).map(t => Number(t))

    // connect db
    connect({ readwrite: true })
    // check auth
    checkAuthorization(req.headers.authorization)

    // check exist asset
    const cnt = getCount({
      table: tables.asset,
      where: 'id = $id',
      values: { '$id': id },
    })
    if (!cnt.data) throw new ServiceError('에셋 데이터가 없습니다.')

    // get collections
    const beforeCollections = getItems({
      table: tables.mapCollectionAsset,
      fields: [ 'collection' ],
      where: 'asset = $asset',
      values: { '$asset': id },
    })
    const beforeCollectionsIds = beforeCollections.data?.length > 0 ? beforeCollections.data.map(o => o.collection) : []

    // get compare
    const compare = compareArrays(beforeCollectionsIds, collections)

    // add collections
    if (compare.added?.length > 0)
    {
      const collectionData = getItems({
        table: tables.collection,
        fields: [ 'id' ],
        where: `id in (${compare.added.join(',')})`,
      })
      if (collectionData.data?.length > 0)
      {
        addItems({
          table: tables.mapCollectionAsset,
          fields: [ 'collection', 'asset' ],
          values: collectionData.data.map(o => ([ o.id, id ])),
        })
      }
    }

    // remove collections
    if (compare.removed?.length > 0)
    {
      removeItem({
        table: tables.mapCollectionAsset,
        where: `collection in (${compare.removed.join(',')})`,
      })
    }

    // close db
    disconnect()
    // result
    success(req, res, { message: '에셋-콜렉션 맵을 업데이트 했습니다.' })
  }
  catch (e)
  {
    console.error(e)
    // close db
    disconnect()
    // result
    error(req, res, {
      code: e.code,
      message: '에셋-콜렉션 맵을 업데이트하지 못했습니다.',
      _file: __filename,
      _err: e,
    })
  }
}
