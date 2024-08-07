/**
 * [GET] /share/:code/
 *
 * Get share data
 * 공유코드로 에셋 상세보기 데이터를 가져온다.
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
    const code = req.params.code
    if (!code) throw new ServiceError('code 값이 없습니다.', 204)

    // connect db
    connect({ readwrite: true })

    // get share data
    const share = getItem({
      table: tables.share,
      fields: [
        `${tables.share}.*`,
        `${tables.owner}.user`,
        `${tables.owner}.public`,
      ],
      join: `join ${tables.owner} on ${tables.owner}.asset = ${tables.share}.asset`,
      where: `${tables.share}.code = $code`,
      values: { '$code': code },
    })
    if (!share?.data) throw new ServiceError('공유 데이터가 없습니다.', 204)

    // 비공개라서 인증 검사한다.
    if (share.data.public !== 1)
    {
      checkAuthorization(req.headers.authorization)
    }

    // get asset
    const asset = getItem({
      table: tables.asset,
      where: `id = $id`,
      values: { '$id': share.data.asset },
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
        `${tables.file}.meta`,
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
            meta: parseJSON(o.meta),
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

    // close db
    disconnect()
    // result
    success(req, res, {
      message: '공유용 에셋의 상세정보',
      data: {
        id: asset.data.id,
        title: asset.data.title,
        description: asset.data.description,
        files,
        regdate: asset.data.regdate,
      },
    })
  }
  catch (e)
  {
    // close db
    disconnect()
    // result
    switch (e.code)
    {
      case 204:
        success(req, res, {
          message: '공유용 에셋 데이터가 없습니다.',
          code: 204,
        })
        break
      // case 401:
      // case 403:
      //   error(req, res, {
      //     code: 403,
      //     message: '공유용 에셋을 가져오지 못했습니다.',
      //     _file: __filename,
      //     _err: e,
      //   })
      //   break
      default:
        error(req, res, {
          code: e.code,
          message: '공유용 에셋을 가져오지 못했습니다.',
          _file: __filename,
          _err: e,
        })
        break
    }
  }
}
