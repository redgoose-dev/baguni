/**
 * [GET] /asset
 *
 * Get asset
 * 에셋 상세보기
 */

import { success, error } from '../output.js'
import { connect, disconnect, tables, getItem, getItems } from '../../libs/db.js'
import { checkAuthorization } from '../../libs/token.js'
import { fileTypes } from '../../libs/consts.js'
import { parseJSON } from '../../libs/objects.js'
import { addLog } from '../../libs/log.js'
import ServiceError from '../../libs/ServiceError.js'

export default async (req, res) => {
  try
  {
    const id = Number(req.params.id)
    if (!id) throw new ServiceError('id 값이 없습니다.', 204)
    // connect db
    connect({ readwrite: true })
    // check auth
    checkAuthorization(req.headers.authorization)

    // get data
    const asset = getItem({
      table: tables.asset,
      where: 'id = $id',
      values: { '$id': id },
    }).data
    if (!asset) throw new ServiceError('에셋 데이터가 없습니다.', 204)
    asset.json = parseJSON(asset.json)

    // get file
    const filesData = getItems({
      table: tables.file,
      fields: [
        `${tables.file}.id`,
        `${tables.file}.name`,
        `${tables.file}.type as mime`,
        `${tables.file}.size`,
        `${tables.file}.regdate`,
        `${tables.mapAssetFile}.type`,
      ],
      join: `join ${tables.mapAssetFile} on ${tables.file}.id = ${tables.mapAssetFile}.file`,
      where: `${tables.mapAssetFile}.asset = $asset`,
      values: { '$asset': asset.id },
    })
    let files = {}
    filesData.data.forEach(o => {
      switch (o.type)
      {
        case fileTypes.main:
          files.main = {
            id: o.id,
            name: o.name,
            type: o.mime,
            size: o.size,
            date: o.regdate,
          }
          break
        case fileTypes.coverOriginal:
          files.coverOriginal = o.id
          break
        case fileTypes.coverCreate:
          files.coverCreate = o.id
          break
        case fileTypes.body:
          if (!files.body) files.body = []
          files.body.push(o.id)
          break
      }
    })

    // get tags
    const tags = getItems({
      table: tables.tag,
      fields: [ `${tables.tag}.*` ],
      join: `join ${tables.mapAssetTag} on ${tables.tag}.id = ${tables.mapAssetTag}.tag`,
      where: `${tables.mapAssetTag}.asset = $id`,
      values: { '$id': asset.id },
    }).data

    // get collections
    let collections = getItems({
      table: tables.mapCollectionAsset,
      fields: [ 'collection' ],
      where: 'asset = $asset',
      values: {
        '$asset': id,
      },
    })
    if (collections.data?.length > 0)
    {
      collections = collections.data.map(o => (o.collection))
    }
    else
    {
      collections = null
    }

    // close db
    disconnect()
    // result
    success(res, {
      message: '에셋의 상세정보',
      data: {
        id: asset.id,
        title: asset.title,
        description: asset.description,
        files,
        tags: tags.map(tag => (tag.name)),
        collections,
        regdate: asset.regdate,
      },
    })
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
      message: '에셋을 가져오지 못했습니다.',
    })
  }
}
