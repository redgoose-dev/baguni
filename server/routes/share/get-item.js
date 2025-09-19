/**
 * [GET] /share/:code/
 *
 * Get share data
 * 공유코드로 에셋 상세보기 데이터를 가져온다.
 */

import ServiceError from '../../classes/ServiceError.js'
import { pref } from '../../classes/Preference.js'
import { onRequest, onResponse, setResponse } from '../../libs/service.js'
import { connect, disconnect, tables, getItems, getItem } from '../../libs/db.js'
import { checkAuthorization } from '../../libs/token.js'
import { parseJSON } from '../../libs/objects.js'
import { fileTypes } from '../../libs/assets.js'
import { ASSET_MODE } from '../asset/_lib.js'

const { URL_PATH } = Bun.env

export default async (req, _ctx) => {

  let response

  // trigger request event
  await onRequest(req, _ctx)

  try
  {
    const code = String(req.params.code)
    if (!code) throw new ServiceError('CODE 값이 없습니다.', { status: 204 })

    // connect db
    connect({ readonly: true })

    // get share data
    const share = getItem({
      table: tables.share,
      where: `code LIKE '${code}'`,
    }).data
    if (!share)
    {
      throw new ServiceError('공유 데이터가 없습니다.', { status: 204 })
    }

    // get asset
    const asset = getItem({
      table: tables.asset,
      where: `id = ${share.asset}`,
    }).data
    if (!asset)
    {
      throw new ServiceError('에셋 데이터가 없습니다.', { status: 400 })
    }
    asset.json = parseJSON(asset.json)

    // 에셋이 비공개 모드라면 인증 검사한다.
    if (asset.mode === ASSET_MODE.PRIVATE)
    {
      checkAuthorization(req)
    }

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
      }
    })

    // set response
    response = setResponse({
      message: '공유용 에셋의 상세정보',
      data: {
        id: asset.id,
        title: asset.title,
        description: asset.description,
        files,
        created_at: asset.created_at,
        url: URL_PATH,
        appName: pref.appName,
      },
    })
  }
  catch (_e)
  {
    req.err = _e
    switch (_e.status)
    {
      case 204:
        response = setResponse('공유용 에셋 데이터가 없습니다.', 204)
        break
      default:
        response = setResponse(new ServiceError('공유용 에셋을 가져오지 못했습니다.', {
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
