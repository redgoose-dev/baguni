/**
 * [PUT] /asset
 *
 * Edit asset
 * issue: https://github.com/redgoose-dev/baguni/issues/6
 */

import multer from 'multer'
import { existsSync, rmSync } from 'node:fs'
import { tagRegex } from '../../../global/strings.js'
import { ownerModes } from '../../../global/consts.js'
import { uploader } from '../../libs/uploader.js'
import { uploadFields, fileTypes } from '../../libs/consts.js'
import { success, error } from '../output.js'
import { connect, disconnect, tables, getItem, getItems, editItem, addItem, getCount, removeItem } from '../../libs/db.js'
import { checkAuthorization } from '../../libs/token.js'
import { parseJSON, compareArrays, checkExistValueInObject, findObjectByValue } from '../../libs/objects.js'
import { filteringTitle } from '../../libs/strings.js'
import { addTag, removeTag, addFileData, editFileData, removeJunkFiles, removeFile, checkAssetOwner } from '../../libs/service.js'
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
      if (!id) throw new ServiceError('id 값이 없습니다.')

      let { title, description, json, tags, remove_files } = req.body
      let readyUpdate = {
        title: undefined,
        description: undefined,
        type: undefined,
        json: undefined,
        tags: undefined,
      }

      // connect db
      connect({ readwrite: true })
      // check auth
      const auth = checkAuthorization(req.headers.authorization)

      // check owner
      checkAssetOwner(ownerModes.ASSET, auth.id, id)

      // get item
      const asset = getItem({
        table: tables.asset,
        where: 'id = $id',
        values: { '$id': id },
      })
      if (!asset?.data) throw new ServiceError('에셋 데이터가 없습니다.')

      // 파일 데이터 가져오기
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

      // 태그 데이터 가져오기
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

      // ready update files
      let removeFiles
      if (remove_files) removeFiles = remove_files.split(',')
      // update main file
      if (removeFiles?.includes(fileTypes.main))
      {
        removeFileData({
          map: srcMapFiles,
          fileType: fileTypes.main,
        })
      }
      else
      {
        const newFileMain = req.files?.[uploadFields.file]?.[0]
        if (newFileMain)
        {
          updateFile({
            file: newFileMain,
            map: srcMapFiles,
            fileType: fileTypes.main,
            assetId: id,
          })
          readyUpdate.type = newFileMain.mimetype
        }
      }
      // update cover original file
      if (removeFiles?.includes(fileTypes.coverOriginal))
      {
        removeFileData({
          map: srcMapFiles,
          fileType: fileTypes.coverOriginal,
        })
      }
      else
      {
        const fileCoverOriginal = req.files?.[uploadFields.coverOriginal]?.[0]
        updateFile({
          file: fileCoverOriginal,
          map: srcMapFiles,
          fileType: fileTypes.coverOriginal,
          assetId: id,
        })
      }
      // update cover create file
      if (removeFiles?.includes(fileTypes.coverCreate))
      {
        removeFileData({
          map: srcMapFiles,
          fileType: fileTypes.coverCreate,
        })
      }
      else
      {
        const fileCreate = req.files?.[uploadFields.coverCreate]?.[0]
        updateFile({
          file: fileCreate,
          map: srcMapFiles,
          fileType: fileTypes.coverCreate,
          assetId: id,
        })
      }

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
        const afterTagsArray = tags.split(',').map(x => {
          x = x.trim()
          if (!tagRegex().test(x)) return false
          return x
        }).filter(Boolean)
        const compare = compareArrays(beforeTagsArray, afterTagsArray)
        readyUpdate.tags = (compare.added?.length > 0 || compare.removed?.length > 0) ? compare : undefined
      }

      // update tags
      updateTags(readyUpdate.tags, id)

      // update data
      updateData(readyUpdate, id)

      // close db
      disconnect()
      // result
      success(req, res, {
        message: '에셋을 수정했습니다.',
      })
    }
    catch (e)
    {
      // 이미 업로드한 파일들은 전부 삭제한다.
      removeJunkFiles(req.files)
      // close db
      disconnect()
      // result
      error(req, res, {
        code: e.code,
        message: '에셋을 수정하지 못했습니다.',
        _file: __filename,
        _err: e,
      })
    }
  })
}

function updateFile(options)
{
  const { file, map, fileType, assetId } = options
  if (!file) return
  const data = findObjectByValue(map, 'type', fileType)
  if (data?.file)
  {
    editFileData(file, data.file)
    if (existsSync(data.path)) rmSync(data.path)
  }
  else
  {
    const fileMainId = addFileData(file)
    const mapCount = getCount({
      table: tables.mapAssetFile,
      where: 'asset = $asset and type = $type',
      values: {
        '$asset': assetId,
        '$type': fileType,
      },
    })
    if (mapCount.data > 0)
    {
      editItem({
        table: tables.mapAssetFile,
        where: `asset = $asset and type = $type`,
        set: [ 'file = $file' ],
        values: {
          '$asset': assetId,
          '$type': fileType,
          '$file': fileMainId,
        },
      })
    }
    else
    {
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
}
function removeFileData(options)
{
  const { map, fileType } = options
  const data = findObjectByValue(map, 'type', fileType)
  if (!data) return
  removeItem({
    table: tables.file,
    where: 'id = $id',
    values: { '$id': data.file },
  })
  removeItem({
    table: tables.mapAssetFile,
    where: 'id = $id',
    values: { '$id': data.id },
  })
  removeFile(data.path)
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

function updateData(data, assetId)
{
  if (!data) return
  if (!checkExistValueInObject(data, ['title', 'description', 'type', 'json'])) return
  editItem({
    table: tables.asset,
    where: 'id = $id',
    set: [
      data.title && 'title = $title',
      data.description && 'description = $description',
      data.type && 'type = $type',
      data.json && 'json = $json',
      'updated_at = CURRENT_TIMESTAMP',
    ].filter(Boolean),
    values: {
      '$id': assetId,
      '$title': data.title,
      '$description': data.description,
      '$type': data.type,
      '$json': data.json,
    },
  })
}
