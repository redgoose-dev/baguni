/**
 * [PATCH] /asset/:id/
 *
 * Edit asset
 * issue: https://github.com/redgoose-dev/baguni/issues/6
 */

import ServiceError from '../../classes/ServiceError.js'
import { onRequest, onResponse, setResponse, getFormData } from '../../libs/service.js'
import { connect, disconnect, tables, getItems, getItem, editItem } from '../../libs/db.js'
import { checkAuthorization } from '../../libs/token.js'
import { parseJSON, checkExistInObject, compareArrays } from '../../libs/objects.js'
import { fileTypes } from '../../libs/assets.js'
import { checkAssetMode } from './_lib.js'
import { checkFile, changeFileData, removeFileData, removeJunkFiles, removeFile, getCachePath } from '../file/_lib.js'
import { addTagData, removeTagData, tagRegex } from '../tag/_lib.js'

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
    let { title, description, json, tags, file, cover_origin, cover_create, remove_files, mode } = body
    let readyUpdate = {
      title: undefined,
      description: undefined,
      type: undefined,
      json: undefined,
      tags: undefined,
      mode: undefined,
    }

    // connect db
    connect({ readwrite: true })

    // check auth
    const auth = checkAuthorization(req)

    // get item
    const asset = getItem({
      table: tables.asset,
      where: `id = ${id}`,
    }).data
    if (!asset)
    {
      throw new ServiceError('에셋 데이터가 없습니다.', { status: 204 })
    }

    // 파일 데이터 가져오기
    let _files = getItems({
      table: tables.file,
      fields: [ 'id', 'mode' ],
      where: `module LIKE $module AND module_id = $module_id`,
      values: {
        '$module': tables.asset,
        '$module_id': id,
      },
    }).data
    const srcMapFiles = {
      [fileTypes.main]: _files.find(obj => obj['mode'] === fileTypes.main),
      [fileTypes.body]: _files.filter(o => o['mode'] === fileTypes.body),
      [fileTypes.coverOrigin]: _files.find(obj => obj['mode'] === fileTypes.coverOrigin),
      [fileTypes.coverCreate]: _files.find(obj => obj['mode'] === fileTypes.coverCreate),
    }

    // 태그 데이터 가져오기
    const srcTags = getItems({
      table: tables.tag,
      fields: [ `${tables.tag}.*` ],
      join: `JOIN ${tables.mapAssetTag} ON ${tables.tag}.id = ${tables.mapAssetTag}.tag`,
      where: `asset = $asset`,
      values: { '$asset': id },
    }).data

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
    // 파일 업데이트 - 메인
    if (removeFiles?.includes(fileTypes.main))
    {
      if (srcMapFiles[fileTypes.main])
      {
        removeFileData(srcMapFiles[fileTypes.main].id)
      }
      readyUpdate.type = ''
    }
    else if (file)
    {
      if (!checkFile(file))
      {
        throw new ServiceError(`'file' 잘못된 파일 형식입니다.`, { status: 400 })
      }
      await changeFileData({
        id: srcMapFiles[fileTypes.main]?.id,
        module: tables.asset,
        module_id: id,
        mode: fileTypes.main,
        file,
      })
      readyUpdate.type = file.type
    }
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
        module: tables.asset,
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
        module: tables.asset,
        module_id: id,
        mode: fileTypes.coverCreate,
        file: cover_create,
      })
    }

    // update json
    if (json)
    {
      json = parseJSON(json) || {}
      readyUpdate.json = JSON.stringify(json)
    }

    // update tags
    if (tags)
    {
      const beforeTagsArray = srcTags.map(o => (o.name))
      const afterTagsArray = tags.split(',').map(x => {
        x = x.trim()
        if (!tagRegex().test(x)) return false
        return x
      }).filter(Boolean)
      const compare = compareArrays(beforeTagsArray, afterTagsArray)
      readyUpdate.tags = (compare.added?.length > 0 || compare.removed?.length > 0) ? compare : null
      if (readyUpdate.tags?.removed?.length > 0)
      {
        readyUpdate.tags.removed.forEach(tag => removeTagData(tag, id))
      }
      if (readyUpdate.tags?.added?.length > 0)
      {
        readyUpdate.tags.added.forEach(tag => addTagData(tag, id))
      }
    }

    // update mode
    if (mode) {
      readyUpdate.mode = checkAssetMode(mode)
      if (_files?.length > 0)
      {
        for (const _file of _files)
        {
          // remove cache
          await removeFile(getCachePath(_file.id))
        }
      }
    }

    // update data
    if (checkExistInObject(readyUpdate, [ 'title', 'description', 'type', 'json', 'mode' ]))
    {
      editItem({
        table: tables.asset,
        where: 'id = $id',
        set: [
          readyUpdate.title && 'title = $title',
          readyUpdate.description !== undefined && 'description = $description',
          readyUpdate.type !== undefined && 'type = $type',
          readyUpdate.json && 'json = $json',
          readyUpdate.mode && 'mode = $mode',
          'updated_at = CURRENT_TIMESTAMP',
        ].filter(Boolean),
        values: {
          '$id': id,
          '$title': readyUpdate.title,
          '$description': readyUpdate.description,
          '$type': readyUpdate.type,
          '$json': readyUpdate.json,
          '$mode': readyUpdate.mode,
        },
      })
    }

    // set response
    response = setResponse({
      message: '에셋을 수정했습니다.',
    })
  }
  catch (_e)
  {
    req.err = _e
    // remove junk files
    await removeJunkFiles(uploadedFiles)
    // set response
    response = setResponse(new ServiceError('에셋을 수정하지 못했습니다.', {
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
