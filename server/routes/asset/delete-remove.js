/**
 * [DELETE] /asset
 *
 * Delete asset
 */

import { success, error } from '../output.js'
import { connect, disconnect, tables, getItem, getItems, removeItem, getCount } from '../../libs/db.js'
import { checkAuthorization } from '../../libs/token.js'
import { removeFile } from '../../libs/service.js'
import ServiceError from '../../libs/ServiceError.js'

export default async (req, res) => {
  try
  {
    const id = Number(req.params.id)
    if (!id) throw new ServiceError('id 값이 없습니다.', 500)
    // connect db
    connect({ readwrite: true })
    // check auth
    checkAuthorization(req.headers.authorization)

    // get asset data
    const asset = getItem({
      table: tables.asset,
      where: 'id = $id',
      values: { '$id': id },
    })
    if (!asset?.data) throw new ServiceError('에셋 데이터가 없습니다.', 500)

    // remove files
    const filesMap = getItems({
      table: tables.file,
      fields: [
        `${tables.mapAssetFile}.*`,
        `${tables.file}.path`,
      ],
      join: `join ${tables.mapAssetFile} on ${tables.file}.id = ${tables.mapAssetFile}.file`,
      where: `${tables.mapAssetFile}.asset = $asset`,
      values: { '$asset': id },
    })
    filesMap.data.forEach(item => {
      if (item.file)
      {
        removeItem({
          table: tables.file,
          where: 'id = $id',
          values: { '$id': item.file },
        })
      }
      if (item.path) removeFile(item.path)
    })
    removeItem({
      table: tables.mapAssetFile,
      where: 'asset = $asset',
      values: { '$asset': id },
    })

    // remove tags
    const tagsMap = getItems({
      table: tables.mapAssetTag,
      where: 'asset = $asset',
      values: { '$asset': id },
    }).data
    removeItem({
      table: tables.mapAssetTag,
      where: 'asset = $asset',
      values: { '$asset': id },
    })
    tagsMap.forEach(item => {
      const count = getCount({
        table: tables.mapAssetTag,
        where: 'tag = $tag',
        values: { '$tag': item.tag },
      }).data
      if (count > 0) return
      removeItem({
        table: tables.tag,
        where: 'id = $id',
        values: { '$id': item.tag },
      })
    })

    // remove data in collection/asset map table
    removeItem({
      table: tables.mapCollectionAsset,
      where: 'asset = $asset',
      values: { '$asset': id },
    })

    // remove data
    removeItem({
      table: tables.asset,
      where: 'id = $id',
      values: { '$id': id },
    })

    // close db
    disconnect()
    // result
    success(req, res, { message: '에셋을 삭제했습니다.' })
  }
  catch (e)
  {
    // close db
    disconnect()
    // result
    error(req, res, {
      code: e.code,
      message: '에셋을 삭제하지 못했습니다.',
      _file: __filename,
      _err: e,
    })
  }
}
