/**
 * [PATCH] /collection/:id/
 *
 * 컬렉션 수정
 */

import ServiceError from '../../classes/ServiceError.js'
import { onRequest, onResponse, setResponse, getFormData } from '../../libs/service.js'
import { connect, disconnect, tables, getItems, getItem, editItem } from '../../libs/db.js'
import { checkAuthorization } from '../../libs/token.js'
import { checkExistInObject } from '../../libs/objects.js'
import { fileTypes } from '../../libs/assets.js'
import { checkFile, changeFileData, removeFileData, removeJunkFiles } from '../file/_lib.js'

export default async (req, _ctx) => {

  let response
  let uploadedFiles = {}

  // trigger request event
  await onRequest(req, _ctx)

  try
  {
    const id = Number(req.params.id)
    if (!id) throw new ServiceError('ID 값이 없습니다.', { status: 204 })

    // get body
    const body = await getFormData(req)
    let { title, description, cover_origin, cover_create, remove_files } = body
    let readyUpdate = {
      title: undefined,
      description: undefined,
    }

    // connect db
    connect({ readwrite: true })

    // check auth
    const auth = checkAuthorization(req)

    // get item
    const collection = getItem({
      table: tables.collection,
      where: `id = ${id}`,
    }).data
    if (!collection)
    {
      throw new ServiceError('컬렉션 데이터가 없습니다.', { status: 204 })
    }

    // get files
    let _files = getItems({
      table: tables.file,
      fields: [ 'id', 'mode' ],
      where: `module LIKE $module AND module_id = $module_id`,
      values: {
        '$module': tables.collection,
        '$module_id': id,
      },
    }).data
    const srcMapFiles = {
      [fileTypes.coverOrigin]: _files.find(obj => obj['mode'] === fileTypes.coverOrigin),
      [fileTypes.coverCreate]: _files.find(obj => obj['mode'] === fileTypes.coverCreate),
    }

    // update title
    if (title)
    {
      readyUpdate.title = title.trim()
    }

    // update description
    if (description)
    {
      readyUpdate.description = description
    }

    // ready update files
    let removeFiles
    if (remove_files) removeFiles = remove_files.split(',')
    // 파일 업데이트 - 커버 원본
    if (removeFiles?.includes(fileTypes.coverOrigin))
    {
      if (srcMapFiles[fileTypes.coverOrigin])
      {
        removeFileData(srcMapFiles[fileTypes.coverOrigin].id)
      }
    }
    else if (cover_origin)
    {
      if (!checkFile(cover_origin))
      {
        throw new ServiceError(`'cover_origin' 잘못된 파일 형식입니다.`, { status: 400 })
      }
      await changeFileData({
        id: srcMapFiles[fileTypes.coverOrigin]?.id,
        module: tables.collection,
        module_id: id,
        mode: fileTypes.coverOrigin,
        file: cover_origin,
      })
    }
    // 파일 업데이트 - 커버 생성본
    if (removeFiles?.includes(fileTypes.coverCreate))
    {
      if (srcMapFiles[fileTypes.coverCreate])
      {
        removeFileData(srcMapFiles[fileTypes.coverCreate].id)
      }
    }
    else if (cover_create)
    {
      if (!checkFile(cover_create))
      {
        throw new ServiceError(`'cover_create' 잘못된 파일 형식입니다.`, { status: 400 })
      }
      await changeFileData({
        id: srcMapFiles[fileTypes.coverCreate]?.id,
        module: tables.collection,
        module_id: id,
        mode: fileTypes.coverCreate,
        file: cover_create,
      })
    }

    // update data
    if (checkExistInObject(readyUpdate, Object.keys(readyUpdate)))
    {
      editItem({
        table: tables.collection,
        where: 'id = $id',
        set: [
          readyUpdate.title && 'title = $title',
          readyUpdate.description !== undefined && 'description = $description',
        ].filter(Boolean),
        values: {
          '$id': id,
          '$title': readyUpdate.title,
          '$description': readyUpdate.description,
        },
      })
    }

    // set response
    response = setResponse({
      message: '컬렉션을 수정했습니다.',
    })
  }
  catch (_e)
  {
    req.err = _e
    // remove junk files
    await removeJunkFiles(uploadedFiles)
    // set response
    response = setResponse(new ServiceError('컬렉션을 수정하지 못했습니다.', {
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
