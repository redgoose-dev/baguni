/**
 * [GET] /asset/:id/
 *
 * Get asset
 * 에셋 상세보기 데이터 가져오기
 */

import ServiceError from '../../classes/ServiceError.js'
import { onRequest, onResponse, setResponse } from '../../libs/service.js'
import { connect, disconnect, tables, getItems, getItem } from '../../libs/db.js'
import { checkAuthorization } from '../../libs/token.js'
import { parseJSON } from '../../libs/objects.js'
import { fileTypes } from '../../libs/assets.js'

export default async (req, _ctx) => {

  let response

  // trigger request event
  await onRequest(req, _ctx)

  try
  {
    const id = Number(req.params.id)
    if (!id) throw new ServiceError('ID 값이 없습니다.', { status: 204 })

    // connect db
    connect({ readonly: true })

    // check auth
    const auth = checkAuthorization(req)

    // get data
    const asset = getItem({
      table: tables.asset,
      where: 'id = $id',
      values: { '$id': id },
    }).data
    if (!asset)
    {
      throw new ServiceError('에셋 데이터가 없습니다.', {
        status: 204,
      })
    }
    asset.json = parseJSON(asset.json)

    // get file
    const filesData = getItems({
      table: tables.file,
      where: `module LIKE $module AND module_id = $module_id`,
      values: {
        '$module': tables.asset,
        '$module_id': asset.id,
      },
    }).data
    let files = {}
    filesData.forEach(o => {
      switch (o.mode)
      {
        case fileTypes.main:
          files.main = {
            id: o.id,
            name: o.name,
            type: o.type,
            size: o.size,
            meta: parseJSON(o.meta),
            created_at: o.created_at,
          }
          break
        case fileTypes.coverOrigin:
          files.coverOrigin = o.id
          break
        case fileTypes.coverCreate:
          files.coverCreate = o.id
          break
        case fileTypes.body:
          if (!files.body) files.body = []
          files.body.push({
            id: o.id,
            name: o.name,
            type: o.type,
            size: o.size,
            meta: parseJSON(o.meta),
            created_at: o.created_at,
          })
          break
      }
    })

    // get tags
    const tags = getItems({
      table: tables.tag,
      fields: [ `${tables.tag}.*` ],
      join: `JOIN ${tables.mapAssetTag} ON ${tables.tag}.id = ${tables.mapAssetTag}.tag`,
      where: `${tables.mapAssetTag}.asset = $id`,
      values: { '$id': asset.id },
    }).data

    // get collections
    let collections = getItems({
      table: tables.mapCollectionAsset,
      fields: [ `${tables.collection}.id` ],
      join: `JOIN ${tables.collection} ON ${tables.collection}.id = ${tables.mapCollectionAsset}.collection`,
      where: `asset = ${id}`,
    }).data
    collections = collections?.length > 0 ? collections.map(o => (o.id)) : []

    // set response
    response = setResponse({
      message: '에셋의 상세정보',
      data: {
        id: asset.id,
        title: asset.title,
        description: asset.description,
        json: asset.json || {},
        files,
        tags: tags?.length > 0 ? tags.map(tag => (tag.name)) : [],
        collections,
        mode: asset.mode,
        created_at: asset.created_at,
      },
    })
  }
  catch (_e)
  {
    req.err = _e
    switch (_e.status)
    {
      case 204:
        response = setResponse('에셋 데이터가 없습니다.', 204)
        break
      default:
        response = setResponse(new ServiceError('에셋 정보를 가져오지 못했습니다.', {
          status: _e.status,
          text: _e.statusText || _e.message,
          url: `${req.method} ${req.url}`,
        }))
        break
    }
  }
  finally
  {
    disconnect()
  }

  // trigger response event
  await onResponse(req, response, _ctx)

  return response

}
