/**
 * [PUT] /share/
 *
 * Get share code
 * 에셋 공유 코드를 가져온다. 공유 데이터가 없으면 데이터를 만든다.
 */

import { randomBytes } from 'node:crypto'
import ServiceError from '../../classes/ServiceError.js'
import { onRequest, onResponse, setResponse, getFormData } from '../../libs/service.js'
import { connect, disconnect, tables, getCount, getItem, addItem } from '../../libs/db.js'
import { checkAuthorization } from '../../libs/token.js'

export default async (req, _ctx) => {

  let response

  // trigger request event
  await onRequest(req, _ctx)

  try
  {
    const id = Number(req.params.id)
    if (!id) throw new ServiceError('에셋 ID 값이 없습니다.', { status: 204 })

    // connect db
    connect({ readwrite: true })

    // check auth
    const auth = checkAuthorization(req)

    // check asset data
    const asset = getItem({
      table: tables.asset,
      fields: [ 'id', 'mode' ],
      where: `id = ${id}`,
    }).data
    if (!asset)
    {
      throw new ServiceError('에셋이 없습니다.', {
        status: 204,
      })
    }

    // get share data
    const share = getItem({
      table: tables.share,
      where: `asset = ${id}`,
    }).data

    // make code
    let code
    if (share)
    {
      code = share.code
    }
    else
    {
      code = randomBytes(8).toString('hex')
      let newData = addItem({
        table: tables.share,
        values: [
          { key: 'code', value: code },
          { key: 'asset', value: id },
          { key: 'created_at', valueName: 'CURRENT_TIMESTAMP', },
        ],
      })
      newData = getItem({
        table: tables.share,
        where: `id = ${newData.data}`,
      }).data
      if (!newData)
      {
        throw new ServiceError('새로운 공유 데이터를 만드는데 실패했습니다.')
      }
      code = newData.code
    }

    // set response
    response = setResponse({
      message: '에셋 공유코드',
      data: {
        code,
        mode: asset.mode,
      },
    })
  }
  catch (_e)
  {
    switch (_e.status)
    {
      case 204:
        response = setResponse('에셋 공유코드가 없습니다.', 204)
        break
      default:
        response = setResponse(new ServiceError('에셋 공유코드를 가져오지 못했습니다.', {
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
