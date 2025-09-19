/**
 * [PUT] /collection/:id/asset/:asset/
 *
 * 컬렉션에서 에셋 추가
 */

import ServiceError from '../../classes/ServiceError.js'
import { onRequest, onResponse, setResponse, getFormData } from '../../libs/service.js'
import { connect, disconnect, tables, getCount, addItem } from '../../libs/db.js'
import { checkAuthorization } from '../../libs/token.js'

export default async (req, _ctx) => {

  let response

  // trigger request event
  await onRequest(req, _ctx)

  try
  {
    const id = Number(req.params.id)
    if (!id) throw new ServiceError('컬렉션 ID 값이 없습니다.', { status: 204 })
    const asset_id = Number(req.params.asset)
    if (!asset_id) throw new ServiceError('에셋 ID 값이 없습니다.', { status: 204 })

    // connect db
    connect({ readwrite: true })

    // check auth
    const auth = checkAuthorization(req)

    // check collection data
    const _collection = getCount({
      table: tables.collection,
      where: `id = ${id}`,
    }).data
    if (!(_collection > 0)) throw new ServiceError('컬렉션 데이터가 없습니다.', { status: 400 })

    // check asset data
    const _asset = getCount({
      table: tables.asset,
      where: `id = ${asset_id}`,
    }).data
    if (!(_asset > 0)) throw new ServiceError('에셋 데이터가 없습니다.', { status: 400 })

    // check exist data from map_collection_asset
    const _map = getCount({
      table: tables.mapCollectionAsset,
      where: `collection = ${id} AND asset = ${asset_id}`,
    }).data
    if (_map > 0) throw new ServiceError('이미 에셋이 추가되어 있습니다.', { status: 400 })

    // add data
    const mapId = addItem({
      table: tables.mapCollectionAsset,
      values: [
        { key: 'collection', value: id },
        { key: 'asset', value: asset_id },
      ],
    }).data

    // set response
    response = setResponse({
      message: '컬렉션에 에셋을 추가했습니다.',
      data: {
        map_id: mapId,
      },
    })
  }
  catch (_e)
  {
    req.err = _e
    // set response
    response = setResponse(new ServiceError('컬렉션에 에셋을 추가했습니다.', {
      status: _e.status,
      text: _e.statusText || _e.message,
      url: `${req.method} ${req.url}`,
    }))
  }
  finally
  {
    disconnect()
  }

  // trigger response event
  await onResponse(req, response, _ctx)

  return response

}

