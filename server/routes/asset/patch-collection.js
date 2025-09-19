/**
 * [PATCH] /asset/:id/collections/
 *
 * 에셋에서 여러 컬렉션을 추가하거나 제거한다.
 */

import ServiceError from '../../classes/ServiceError.js'
import { onRequest, onResponse, setResponse, getFormData } from '../../libs/service.js'
import { connect, disconnect, tables, getCount, getItems, addItems, removeItem } from '../../libs/db.js'
import { checkAuthorization } from '../../libs/token.js'
import { compareArrays } from '../../libs/objects.js'

export default async (req, _ctx) => {

  let response

  // trigger request event
  await onRequest(req, _ctx)

  try
  {
    const id = Number(req.params.id)
    if (!id) throw new ServiceError('에셋 ID 값이 없습니다.', { status: 204 })

    // get body
    const body = await getFormData(req)
    let { collections } = body

    // connect db
    connect({ readwrite: true })

    // check auth
    const auth = checkAuthorization(req)

    // set collections
    collections = collections.split(',').filter(Boolean).map(t => Number(t))

    // check exist asset
    const assetCount = getCount({
      table: tables.asset,
      where: `id = ${id}`,
    }).data
    if (!(assetCount > 0))
    {
      throw new ServiceError('에셋 데이터가 없습니다.', { status: 204 })
    }

    // get collections
    const beforeItems = getItems({
      table: tables.mapCollectionAsset,
      fields: [ 'collection' ],
      where: `asset = ${id}`,
    }).data
    const beforeIds = beforeItems?.length > 0 ? beforeItems.map(o => o.collection) : []

    // get compare
    const compare = compareArrays(beforeIds, collections)

    // add collections
    if (compare.added?.length > 0)
    {
      const collectionData = getItems({
        table: tables.collection,
        fields: [ 'id' ],
        where: `id in (${compare.added.join(',')})`,
      }).data
      if (collectionData?.length > 0)
      {
        addItems({
          table: tables.mapCollectionAsset,
          fields: [ 'collection', 'asset' ],
          values: collectionData.map(o => ([ o.id, id ])),
        })
      }
    }

    // remove collections
    if (compare.removed?.length > 0)
    {
      removeItem({
        table: tables.mapCollectionAsset,
        where: `collection IN (${compare.removed.join(',')})`,
      })
    }

    // set response
    response = setResponse({
      message: '에셋/컬렉션 데이터를 업데이트했습니다.',
    })
  }
  catch (_e)
  {
    req.err = _e
    // set response
    response = setResponse(new ServiceError('에셋/컬렉션 데이터를 업데이트하지 못했습니다.', {
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
