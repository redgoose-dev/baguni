/**
 * [DELETE] /asset/:id/file-body/:file/
 *
 * Delete body file from asset
 * 에셋 바디용 파일을 삭제한다.
 */

import ServiceError from '../../../classes/ServiceError.js'
import { onRequest, onResponse, setResponse } from '../../../libs/service.js'
import { connect, disconnect, tables, getCount } from '../../../libs/db.js'
import { checkAuthorization } from '../../../libs/token.js'
import { fileTypes } from '../../../libs/assets.js'
import { removeFileData } from '../../file/_lib.js'

export default async (req, _ctx) => {

  let response

  // trigger request event
  await onRequest(req, _ctx)

  try
  {
    const id = Number(req.params.id)
    const file_id = Number(req.params.file)
    if (!id) throw new ServiceError('에셋 ID 값이 없습니다.', { status: 204 })
    if (!file_id) throw new ServiceError('파일 ID 값이 없습니다.', { status: 204 })

    // connect db
    connect({ readwrite: true })

    // check auth
    const auth = checkAuthorization(req)

    // check file
    const _fileCount = getCount({
      table: tables.file,
      where: 'module LIKE $module AND module_id = $module_id AND id = $file_id AND mode LIKE $mode',
      values: {
        '$module': tables.asset,
        '$module_id': id,
        '$file_id': file_id,
        '$mode': fileTypes.body,
      },
    }).data
    if (!(_fileCount > 0))
    {
      throw new ServiceError('에셋 바디용 파일 데이터가 없습니다.', { status: 204 })
    }

    // remove file and data
    removeFileData(file_id)

    // set response
    response = setResponse({
      message: '에셋 바디용 데이터를 삭제했습니다.',
    })
  }
  catch (_e)
  {
    // set response
    response = setResponse(new ServiceError('에셋 바디용 데이터를 삭제할 수 없습니다.', {
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
