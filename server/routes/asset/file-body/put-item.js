/**
 * [PUT] /asset/:id/file-body/
 *
 * Add body file from asset
 * 에셋 바디용 파일을 추가한다.
 */

import ServiceError from '../../../classes/ServiceError.js'
import { pref } from '../../../classes/Preference.js'
import { onRequest, onResponse, setResponse, getFormData } from '../../../libs/service.js'
import { connect, disconnect, tables, getCount, getItem } from '../../../libs/db.js'
import { checkAuthorization } from '../../../libs/token.js'
import { fileTypes, allowFileTypes } from '../../../libs/assets.js'
import { parseJSON } from '../../../libs/objects.js'
import { checkFile, fileUpload, addFileData, removeJunkFiles } from '../../file/_lib.js'

export default async (req, _ctx) => {

  let response
  let uploadedFile = {}

  // trigger request event
  await onRequest(req, _ctx)

  try
  {
    const id = Number(req.params.id)
    if (!id) throw new ServiceError('에셋 ID 값이 없습니다.', { status: 204 })

    // get body
    let { file } = await getFormData(req)

    // check file
    if (!checkFile(file))
    {
      throw new ServiceError('첨부파일이 없어나 잘못된 형식입니다.', { status: 400 })
    }

    // connect db
    connect({ readwrite: true })

    // check auth
    const auth = checkAuthorization(req)

    // check asset
    const _assetCount = getCount({
      table: tables.asset,
      where: `id = ${id}`,
    }).data
    if (!(_assetCount > 0))
    {
      throw new ServiceError('에셋 데이터가 없습니다.', { status: 204 })
    }

    // upload file
    uploadedFile.body = await fileUpload(fileTypes.body, file, {
      limitSize: pref.file.limit.body,
      allowType: allowFileTypes,
    })

    // add data
    const fileId = addFileData({
      file: uploadedFile.body,
      module: tables.asset,
      module_id: id,
      mode: fileTypes.body,
    })

    // get item
    const newFile = getItem({
      table: tables.file,
      where: `id = ${fileId}`,
    }).data

    // set response
    response = setResponse({
      message: '에셋 바디용 파일을 추가했습니다.',
      data: {
        id: fileId,
        file: {
          id: newFile.id,
          name: newFile.name,
          type: newFile.type,
          size: newFile.size,
          meta: parseJSON(newFile.meta),
        },
      },
    })
  }
  catch (_e)
  {
    // remove junk files
    await removeJunkFiles(uploadedFile)
    // set response
    response = setResponse(new ServiceError('에셋 바디용 파일을 추가하지 못했습니다.', {
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
