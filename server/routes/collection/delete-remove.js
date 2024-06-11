/**
 * [DELETE] /collection
 *
 * Delete collection
 */

import { success, error } from '../output.js'
import { connect, disconnect, tables, getItem, getItems, removeItem } from '../../libs/db.js'
import { checkAuthorization } from '../../libs/token.js'
import { removeFile } from '../../libs/service.js'
import ServiceError from '../../libs/ServiceError.js'

export default async (req, res) => {
  try
  {
    const id = Number(req.params.id)
    if (!id) throw new ServiceError('컬렉션 id 값이 없습니다.')

    // connect db
    connect({ readwrite: true })
    // check auth
    checkAuthorization(req.headers.authorization)

    // get asset data
    const collection = getItem({
      table: tables.collection,
      where: 'id = $id',
      values: { '$id': id },
    })
    if (!collection?.data) throw new ServiceError('컬렉션 데이터가 없습니다.')

    // remove files
    let filesMap = getItems({
      table: tables.file,
      fields: [
        `${tables.mapCollectionFile}.*`,
        `${tables.file}.path`,
      ],
      join: `join ${tables.mapCollectionFile} on ${tables.file}.id = ${tables.mapCollectionFile}.file`,
      where: `${tables.mapCollectionFile}.collection = $collection`,
      values: { '$collection': id },
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
      table: tables.mapCollectionFile,
      where: 'collection = $collection',
      values: { '$collection': id },
    })

    // remove data in collection/asset map table
    removeItem({
      table: tables.mapCollectionAsset,
      where: 'collection = $collection',
      values: { '$collection': id },
    })

    // remove data
    removeItem({
      table: tables.collection,
      where: 'id = $id',
      values: { '$id': id },
    })

    // close db
    disconnect()
    // result
    success(req, res, {
      message: '컬렉션을 삭제했습니다.',
    })
  }
  catch (e)
  {
    // close db
    disconnect()
    // result
    error(req, res, {
      code: e.code,
      message: '컬렉션을 삭제하지 못했습니다.',
      _file: __filename,
      _err: e,
    })
  }
}
