/**
 * [GET] /asset
 *
 * Get asset
 * 에셋 상세보기 데이터 가져오기
 */

import { success, error } from '../output.js'
import { connect, disconnect, tables, getItem, getItems } from '../../libs/db.js'
import { checkAuthorization } from '../../libs/token.js'
import { fileTypes } from '../../libs/consts.js'
import { parseJSON } from '../../libs/objects.js'
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
    })
    if (!asset?.data) throw new ServiceError('에셋 데이터가 없습니다.', 204)
    asset.data.json = parseJSON(asset.data.json)

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
      values: { '$asset': asset.data.id },
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
      values: { '$id': asset.data.id },
    })

    // get collections
    let collections = getItems({
      table: tables.mapCollectionAsset,
      fields: [ 'collection' ],
      where: 'asset = $asset',
      values: { '$asset': asset.data.id },
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
    success(req, res, {
      message: '에셋의 상세정보',
      data: {
        id: asset.data.id,
        title: asset.data.title,
        description: asset.data.description,
        files,
        tags: tags?.data?.length > 0 ? tags.data.map(tag => (tag.name)) : [],
        collections,
        regdate: asset.data.regdate,
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
      message: '에셋을 가져오지 못했습니다.',
      _file: e.code !== 204 ? __filename : undefined,
      _err: e,
    })
  }
}
