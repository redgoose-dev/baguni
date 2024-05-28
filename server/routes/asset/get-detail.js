/**
 * [GET] /asset
 *
 * Get asset
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
    const id = req.params.id
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
      where: `${tables.mapAssetFile}.asset = $asset and ${tables.mapAssetFile}.type like 'asset%'`,
      values: { '$asset': asset.id },
    }).data
    let files = {}
    filesData.forEach(o => {
      switch (o.type)
      {
        case fileTypes.asset:
          files.main = {
            id: o.id,
            name: o.name,
            type: o.mime,
            size: o.size,
            date: o.regdate,
          }
          break
        case fileTypes.assetCoverOriginal:
          files.coverOriginal = o.id
          break
        case fileTypes.assetCoverCreate:
          files.coverCreate = o.id
          break
        case fileTypes.assetBody:
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

    // close db
    disconnect()
    // result
    success(res, {
      message: '에셋의 상세정보',
      data: {
        id: asset.id,
        title: asset.title,
        description: asset.description,
        tags: tags.map(tag => (tag.name)),
        files,
        // collectionAssets: [], // TODO: 콜렉션 API 부분 작업이 끝나면 진행하기
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
