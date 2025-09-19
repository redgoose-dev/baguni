/**
 * [PUT] /collection/
 *
 * 컬렉션 만들기
 */

import ServiceError from '../../classes/ServiceError.js'
import { pref } from '../../classes/Preference.js'
import { onRequest, onResponse, setResponse, getFormData } from '../../libs/service.js'
import { connect, disconnect, tables, addItem } from '../../libs/db.js'
import { checkAuthorization } from '../../libs/token.js'
import { fileTypes, allowFileType } from '../../libs/assets.js'
import { checkFile, addFileData, fileUpload, removeJunkFiles } from '../file/_lib.js'

export default async (req, _ctx) => {

  let response
  let uploadedFiles = {}

  // trigger request event
  await onRequest(req, _ctx)

  try
  {
    // get body
    let { title, description, cover_origin, cover_create } = await getFormData(req)

    // connect db
    connect({ readwrite: true })

    // check auth
    const auth = checkAuthorization(req)

    // set title
    if (title) title = title.trim()

    // upload files
    if (cover_origin)
    {
      if (!checkFile(cover_origin))
      {
        throw new ServiceError(`'cover_origin' 잘못된 파일 형식입니다.`, { status: 400 })
      }
      uploadedFiles.coverOrigin = await fileUpload(fileTypes.coverOrigin, cover_origin, {
        limitSize: pref.file.limit.cover,
        allowType: allowFileType.image,
      })
    }
    if (cover_create)
    {
      if (!checkFile(cover_create))
      {
        throw new ServiceError(`'cover_create' 잘못된 파일 형식입니다.`, { status: 400 })
      }
      uploadedFiles.coverCreate = await fileUpload(fileTypes.coverCreate, cover_create, {
        limitSize: pref.file.limit.cover,
        allowType: allowFileType.image,
      })
    }

    // add data
    const collectionId = addItem({
      table: tables.collection,
      values: [
        title && { key: 'title', value: title },
        description && { key: 'description', value: description },
        { key: 'created_at', valueName: 'CURRENT_TIMESTAMP' },
      ].filter(Boolean),
    }).data

    // add file data
    if (uploadedFiles.coverOrigin)
    {
      addFileData({
        file: uploadedFiles.coverOrigin,
        module: tables.collection,
        module_id: collectionId,
        mode: fileTypes.coverOrigin,
      })
    }
    if (uploadedFiles.coverCreate)
    {
      addFileData({
        file: uploadedFiles.coverCreate,
        module: tables.collection,
        module_id: collectionId,
        mode: fileTypes.coverCreate,
      })
    }

    // set response
    response = setResponse({
      message: '컬렉션을 만들었습니다.',
      data: {
        id: collectionId,
      },
    })
  }
  catch (_e)
  {
    req.err = _e
    // remove junk files
    await removeJunkFiles(uploadedFiles)
    // set response
    response = setResponse(new ServiceError('컬렉션을 추가하지 못했습니다.', {
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
