/**
 * [GET] /collection/:id/
 *
 * 컬렉션의 상세정보를 출력한다.
 */

import ServiceError from '../../classes/ServiceError.js'
import { onRequest, onResponse, setResponse } from '../../libs/service.js'
import { connect, disconnect, tables, getItems, getItem } from '../../libs/db.js'
import { checkAuthorization } from '../../libs/token.js'
import { fileTypes } from '../../libs/assets.js'

export default async (req, _ctx) => {

  let response

  // trigger request event
  await onRequest(req, _ctx)

  try
  {
    const id = Number(req.params.id)
    if (!id) throw new ServiceError('ID 값이 없습니다.', { status: 204 })

    // connect db
    connect({ readonly: true })

    // check auth
    const auth = checkAuthorization(req)

    // get data
    const collection = getItem({
      table: tables.collection,
      where: 'id = $id',
      values: { '$id': id },
    }).data
    if (!collection)
    {
      throw new ServiceError('컬렉션 데이터가 없습니다.', {
        status: 204,
      })
    }

    // get file
    let files = {}
    let _files = getItems({
      table: tables.file,
      fields: [ 'id', 'mode' ],
      where: `module LIKE $module AND module_id = $module_id`,
      values: {
        '$module': tables.collection,
        '$module_id': id,
      },
    })
    _files = _files.data
    if (_files?.length > 0)
    {
      _files.forEach(o => {
        switch (o.mode)
        {
          case fileTypes.coverOrigin:
            files.coverOrigin = o.id
            break
          case fileTypes.coverCreate:
            files.coverCreate = o.id
            break
        }
      })
    }

    // set response
    response = setResponse({
      message: '컬렉션 상세정보',
      data: {
        id: collection.id,
        title: collection.title,
        description: collection.description,
        files,
        created_at: collection.created_at,
      },
    })
  }
  catch (_e)
  {
    req.err = _e
    switch (_e.status)
    {
      case 204:
        response = setResponse('컬렉션 데이터가 없습니다.', 204)
        break
      default:
        response = setResponse(new ServiceError('컬렉션을 가져오지 못했습니다.', {
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
