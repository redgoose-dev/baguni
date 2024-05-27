/**
 * [PUT] /asset
 *
 * Edit asset
 * issue: https://github.com/redgoose-dev/baguni/issues/6
 */

import multer from 'multer'
import { existsSync, rmSync } from 'node:fs'
import { uploader } from '../../libs/uploader.js'
import { uploadFields, fileTypeForAsset } from '../../libs/consts.js'
import { success, error } from '../output.js'
import { connect, disconnect, tables, getItem, getItems, editItem, addItem } from '../../libs/db.js'
import { checkAuthorization } from '../../libs/token.js'
import { addLog } from '../../libs/log.js'
import { parseJSON, compareArrays, checkExistValueInObject, findObjectByValue } from '../../libs/objects.js'
import { filteringTitle } from '../../libs/strings.js'
import { addTag, removeTag, addFileData, editFileData, removeJunkFiles } from '../../libs/service.js'
import ServiceError from '../../libs/ServiceError.js'

export default async (req, res) => {
  const _uploader = uploader()
  const upload = multer(_uploader).fields([
    { name: uploadFields.file, maxCount: 1 },
    { name: uploadFields.coverOriginal, maxCount: 1 },
    { name: uploadFields.coverCreate, maxCount: 1 },
  ])
  upload(req, res, async () => {
    try
    {
      const id = req.params.id
      let err
      if (!id) throw new ServiceError('id 값이 없습니다.', 204)
      let { title, description, json, tags } = req.body
      let readyUpdate = {
        title: undefined,
        description: undefined,
        json: undefined,
        tags: undefined,
      }

      // connect db
      connect({ readwrite: true })
      // check auth
      checkAuthorization(req.headers.authorization)

      // get item
      const srcAsset = getItem({
        table: tables.asset,
        where: 'id = $id',
        values: { '$id': id },
      }).data
      if (!srcAsset) throw new ServiceError('에셋 데이터가 없습니다.', 204)
      srcAsset.json = parseJSON(srcAsset.json)
      const srcMapFiles = getItems({
        table: tables.file,
        fields: [
          `${tables.mapAssetFile}.*`,
          `${tables.file}.path`,
        ],
        join: `join ${tables.mapAssetFile} on ${tables.file}.id = ${tables.mapAssetFile}.file`,
        where: `${tables.mapAssetFile}.asset = $asset`,
        values: { '$asset': id },
      }).data
      const srcTags = getItems({
        table: tables.tag,
        fields: [ `${tables.tag}.*` ],
        join: `join ${tables.mapAssetTag} on ${tables.tag}.id = ${tables.mapAssetTag}.tag`,
        where: `asset = $asset`,
        values: { '$asset': id },
      }).data

      // update title
      if (title)
      {
        readyUpdate.title = filteringTitle(title)
      }

      // update description
      if (description)
      {
        readyUpdate.description = description
      }

      // update files
      const newFileMain = req.files?.[uploadFields.file]?.[0]
      const fileCoverOriginal = req.files?.[uploadFields.coverOriginal]?.[0]
      const fileCreate = req.files?.[uploadFields.coverCreate]?.[0]
      updateFile({
        file: newFileMain,
        map: srcMapFiles,
        fileType: fileTypeForAsset.asset,
        assetId: id,
      })
      updateFile({
        file: fileCoverOriginal,
        map: srcMapFiles,
        fileType: fileTypeForAsset.assetCoverOriginal,
        assetId: id,
      })
      updateFile({
        file: fileCreate,
        map: srcMapFiles,
        fileType: fileTypeForAsset.assetCoverCreate,
        assetId: id,
      })

      // update json
      if (json)
      {
        json = parseJSON(json) || {}
        readyUpdate.json = JSON.stringify(json)
      }

      // update tags
      if (typeof tags === 'string')
      {
        const beforeTagsArray = srcTags.map(o => (o.name))
        const afterTagsArray = tags.split(',').map(x => (x.trim()))
        const compare = compareArrays(beforeTagsArray, afterTagsArray)
        readyUpdate.tags = (compare.added?.length > 0 || compare.removed?.length > 0) ? compare : undefined
      }

      // update data
      updateData(readyUpdate, id)

      // update tags
      updateTags(readyUpdate.tags, id)

      // close db
      disconnect()
      // result
      success(res, { message: '에셋을 수정했습니다.' })
    }
    catch (e)
    {
      // 이미 업로드한 파일들은 전부 삭제한다.
      removeJunkFiles(req.files)
      // add log
      addLog({ mode: 'error', message: e.message })
      // close db
      disconnect()
      // result
      error(res, {
        code: e.code,
        message: '에셋을 수정하지 못했습니다.',
      })
    }
  })
}

function updateData(data, assetId)
{
  if (!data) return
  if (!checkExistValueInObject(data, ['title', 'description', 'json'])) return
  editItem({
    table: tables.asset,
    where: 'id = $id',
    set: [
      data.title && 'title = $title',
      data.description && 'description = $description',
      data.json && 'json = $json',
      'updated_at = CURRENT_TIMESTAMP',
    ],
    values: {
      '$id': assetId,
      '$title': data.title,
      '$description': data.description,
      '$json': data.json,
    },
  })
}

function updateTags(tags, assetId)
{
  if (!tags) return
  if (tags.removed?.length > 0)
  {
    tags.removed.forEach(tag => removeTag(tag, assetId))
  }
  if (tags.added?.length > 0)
  {
    tags.added.forEach(tag => addTag(tag, assetId))
  }
}

function updateFile(options)
{
  const { file, map, fileType, assetId } = options
  if (!file) return
  const data = findObjectByValue(map, 'type', fileType)
  if (data?.path)
  {
    editFileData(file, data.file)
    if (existsSync(data.path)) rmSync(data.path)
  }
  else
  {
    const fileMainId = addFileData(file)
    addItem({
      table: tables.mapAssetFile,
      values: [
        { key: 'asset', value: assetId },
        { key: 'file', value: fileMainId },
        { key: 'type', value: fileType },
      ],
    })
  }
}
