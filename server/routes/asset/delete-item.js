/**
 * [DELETE] /asset/:id/
 *
 * 에셋 삭제하기
 */

import ServiceError from '../../classes/ServiceError.js'
import { onRequest, onResponse, setResponse } from '../../libs/service.js'
import { connect, disconnect, tables, getItem, removeItem } from '../../libs/db.js'
import { checkAuthorization } from '../../libs/token.js'
import { removeFilesData } from '../file/_lib.js'
import { removeTagsByAsset } from '../tag/_lib.js'

export default async (req, _ctx) => {

  let response

  // trigger request event
  await onRequest(req, _ctx)

  try
  {
    const id = Number(req.params.id)
    if (!id) throw new ServiceError('ID 값이 없습니다.', { status: 204 })

    // connect db
    connect({ readwrite: true })

    // check auth
    const auth = checkAuthorization(req)

    // get asset data
    const asset = getItem({
      table: tables.asset,
      where: 'id = $id',
      values: { '$id': id },
    }).data
    if (!asset)
    {
      throw new ServiceError('에셋 데이터가 없습니다.', { status: 400 })
    }

    // remove files
    removeFilesData(tables.asset, id)

    // remove tags
    removeTagsByAsset(id)

    // remove map_collection_asset
    removeItem({
      table: tables.mapCollectionAsset,
      where: `asset = ${id}`,
    })

    // remove share
    removeItem({
      table: tables.share,
      where: `asset = ${id}`,
    })

    // remove asset
    removeItem({
      table: tables.asset,
      where: `id = ${id}`,
    })

    // set response
    response = setResponse({
      message: '에셋을 삭제했습니다.',
    })
  }
  catch (_e)
  {
    req.err = _e
    // set response
    response = setResponse(new ServiceError('에셋을 삭제하지 못했습니다.', {
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
