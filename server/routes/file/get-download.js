/**
 * [GET] /file/:id/download/
 *
 * 파일 다운로드
 */

import ServiceError from '../../classes/ServiceError.js'
import { onRequest, onResponse, setResponse } from '../../libs/service.js'
import { connect, disconnect, tables, getItem } from '../../libs/db.js'
import { checkAuthorization } from '../../libs/token.js'
import { ASSET_MODE } from '../asset/_lib.js'

export default async (req, _ctx) => {

  let response

  // trigger request event
  await onRequest(req, _ctx)

  try
  {
    const id = Number(req.params.id)
    if (!id) throw new ServiceError('ID 값이 없습니다.', { status: 404 })

    // connect db
    connect({ readonly: true })

    // get data
    const file = getItem({
      table: tables.file,
      where: 'id = $id',
      values: { '$id': id },
    }).data
    if (!file)
    {
      throw new ServiceError('파일 데이터가 없습니다.', { status: 404 })
    }

    // get asset data
    let asset
    if (file.module === tables.asset)
    {
      asset = getItem({
        table: tables.asset,
        fields: [ 'id', 'mode' ],
        where: `id = ${file.module_id}`,
      }).data
    }

    // check auth
    if (asset?.mode === ASSET_MODE.PRIVATE || !asset)
    {
      checkAuthorization(req)
    }

    // set file
    const _file = Bun.file(file.path, { type: file.type })

    // check exists
    if (!(await _file.exists()))
    {
      throw new ServiceError('파일이 없습니다.', { status: 404 })
    }

    // get array buffer
    const buffer = await _file.arrayBuffer()

    // set response
    response = setResponse(buffer, 200, {
      headers: {
        'Content-Type': _file.type || 'application/octet-stream',
        'Content-Disposition': `attachment; filename=${file.name}`,
        'Content-Length': String(file.size),
      },
    })
  }
  catch (_e)
  {
    response = setResponse(new ServiceError('파일을 다운로드하지 못했습니다.', {
      status: _e.status,
      text: _e.statusText || _e.message,
      url: `${req.method} ${req.url}`,
    }))
  }
  finally
  {
    disconnect()
  }

  // trigger response event
  await onResponse(req, response, _ctx)

  return response

}
