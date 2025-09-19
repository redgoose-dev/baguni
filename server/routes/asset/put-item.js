/**
 * [PUT] /asset/
 *
 * Create asset
 * issue: https://github.com/redgoose-dev/baguni/issues/5
 */

import ServiceError from '../../classes/ServiceError.js'
import { pref } from '../../classes/Preference.js'
import { onRequest, onResponse, setResponse, getFormData } from '../../libs/service.js'
import { connect, disconnect, tables, addItem } from '../../libs/db.js'
import { checkAuthorization } from '../../libs/token.js'
import { parseJSON } from '../../libs/objects.js'
import { fileTypes, allowFileType } from '../../libs/assets.js'
import { checkAssetMode } from './_lib.js'
import { checkFile, addFileData, fileUpload, removeJunkFiles } from '../file/_lib.js'
import { addTagData } from '../tag/_lib.js'

export default async (req, _ctx) => {

  let response
  let uploadedFiles = {}

  // trigger request event
  await onRequest(req, _ctx)

  try
  {
    // get body
    let { file, cover_origin, cover_create, title, description, json, tags, mode } = await getFormData(req)

    // connect db
    connect({ readwrite: true })

    // check auth
    const auth = checkAuthorization(req)

    // set title
    if (title) title = title.trim()

    // set json
    json = parseJSON(json) || {}
    json = JSON.stringify(json)

    // set mode
    mode = checkAssetMode(mode)

    // upload files
    if (file)
    {
      if (!checkFile(file))
      {
        throw new ServiceError(`'file' 잘못된 파일 형식입니다.`, { status: 400 })
      }
      uploadedFiles.file = await fileUpload(fileTypes.main, file, {
        limitSize: pref.file.limit.main,
        allowType: allowFileType.image,
      })
    }
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
    const assetId = addItem({
      table: tables.asset,
      values: [
        title && { key: 'title', value: title },
        description && { key: 'description', value: description },
        { key: 'type', value: uploadedFiles.file?.mime || null },
        { key: 'json', value: json },
        { key: 'mode', value: mode },
        { key: 'created_at', valueName: 'CURRENT_TIMESTAMP' },
        { key: 'updated_at', valueName: 'CURRENT_TIMESTAMP' },
      ].filter(Boolean),
    }).data

    // add file data
    if (uploadedFiles.file)
    {
      addFileData({
        file: uploadedFiles.file,
        module: tables.asset,
        module_id: assetId,
        mode: fileTypes.main,
      })
    }
    if (uploadedFiles.coverOrigin)
    {
      addFileData({
        file: uploadedFiles.coverOrigin,
        module: tables.asset,
        module_id: assetId,
        mode: fileTypes.coverOrigin,
      })
    }
    if (uploadedFiles.coverCreate)
    {
      addFileData({
        file: uploadedFiles.coverCreate,
        module: tables.asset,
        module_id: assetId,
        mode: fileTypes.coverCreate,
      })
    }

    // add tags data
    if (tags)
    {
      tags.split(',').forEach(tag => addTagData(tag, assetId))
    }

    // set response
    response = setResponse({
      message: '에셋을 만들었습니다.',
      data: {
        id: assetId,
      },
    })
  }
  catch (_e)
  {
    // remove junk files
    await removeJunkFiles(uploadedFiles)
    // set response
    response = setResponse(new ServiceError('에셋을 추가하지 못했습니다.', {
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
