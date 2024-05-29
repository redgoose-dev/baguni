/**
 * [GET] /collection
 *
 * Get collection detail
 * 콜렉션의 상세정보를 출력한다.
 */

import { success, error } from '../output.js'
import { connect, disconnect, tables, getItem, getItems } from '../../libs/db.js'
import { checkAuthorization } from '../../libs/token.js'
import { fileTypes } from '../../libs/consts.js'
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
    const collection = getItem({
      table: tables.collection,
      where: 'id = $id',
      values: { '$id': id },
    })
    if (!collection?.data) throw new ServiceError('콜렉션 데이터가 없습니다.', 204)

    // get file
    const filesData = getItems({
      table: tables.file,
      fields: [
        `${tables.file}.id`,
        `${tables.file}.name`,
        `${tables.file}.type as mime`,
        `${tables.file}.size`,
        `${tables.file}.regdate`,
        `${tables.mapCollectionFile}.type`,
      ],
      join: `join ${tables.mapCollectionFile} on ${tables.file}.id = ${tables.mapCollectionFile}.file`,
      where: `${tables.mapCollectionFile}.collection = $collection`,
      values: { '$collection': collection.data.id },
    })
    let files = {}
    filesData.data.forEach(o => {
      switch (o.type)
      {
        case fileTypes.coverOriginal:
          files.coverOriginal = o.id
          break
        case fileTypes.coverCreate:
          files.coverCreate = o.id
          break
      }
    })

    // close db
    disconnect()
    // result
    success(res, {
      message: '에셋의 상세정보',
      data: {
        id: collection.data.id,
        title: collection.data.title,
        description: collection.data.description,
        files,
        regdate: collection.data.regdate,
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
      message: '콜렉션을 가져오지 못했습니다.',
    })
  }
}
