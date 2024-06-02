/**
 * [GET] /share/:code/
 *
 * Get share data
 * 공유코드로 에셋 상세보기 데이터를 가져온다.
 */

import { success, error } from '../output.js'
import { connect, disconnect, tables, getItem, getItems } from '../../libs/db.js'
import { fileTypes } from '../../libs/consts.js'
import { parseJSON } from '../../libs/objects.js'
import ServiceError from '../../libs/ServiceError.js'
import RunningTimer from '../../libs/RunningTimer.js'

export default async (req, res) => {
  const timer = new RunningTimer()
  try
  {
    const code = req.params.code
    if (!code) throw new ServiceError('code 값이 없습니다.', 204)

    // connect db
    connect({ readwrite: true })

    // get asset
    const asset = getItem({
      table: tables.asset,
      fields: [ `${tables.asset}.*` ],
      join: `join ${tables.share} on ${tables.share}.asset = ${tables.asset}.id`,
      where: `${tables.share}.code = $code`,
      values: {
        '$code': code,
      },
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

    // close db
    disconnect()
    // result
    success(req, res, {
      message: '공유용 에셋의 상세정보',
      processingTime: timer.end(),
      data: {
        id: asset.data.id,
        title: asset.data.title,
        description: asset.data.description,
        files,
        tags: tags?.data?.length > 0 ? tags.data.map(tag => (tag.name)) : [],
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
      message: '공유용 에셋을 가져오지 못했습니다.',
      processingTime: timer.end(),
      _file: e.code !== 204 ? __filename : undefined,
      _err: e,
    })
  }
}
