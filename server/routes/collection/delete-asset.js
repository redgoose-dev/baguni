/**
 * [DELETE] /collection/:id/asset/:asset/
 *
 * Remove asset in collection
 */

import ServiceError from '../../classes/ServiceError.js'
import { onRequest, onResponse, setResponse } from '../../libs/service.js'
import { connect, disconnect, tables, getCount, getItem, removeItem } from '../../libs/db.js'
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

    // check exist asset and collection from map table
    const count = getCount({
      table: tables.mapCollectionAsset,
      where: `collection = ${id} AND asset = ${asset_id}`,
      values: {
        '$collection': id,
        '$asset': asset_id,
      },
    }).data
    if (!(count > 0)) throw new ServiceError('삭제할 데이터가 없습니다.', { status: 400 })

    // remove data
    removeItem({
      table: tables.mapCollectionAsset,
      where: `collection = ${id} AND asset = ${asset_id}`,
    })

    // set response
    response = setResponse({
      message: '에셋을 컬렉션에서 제거했습니다.',
    })
  }
  catch (_e)
  {
    req.err = _e
    // set response
    response = setResponse(new ServiceError('에셋을 컬렉션에 제거하지 못했습니다.', {
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
