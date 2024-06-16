/**
 * [PUT] /asset
 *
 * Edit asset
 * issue: https://github.com/redgoose-dev/baguni/issues/6
 */

import multer from 'multer'
import { existsSync, rmSync } from 'node:fs'
import { uploader } from '../../libs/uploader.js'
import { uploadFields, fileTypes } from '../../libs/consts.js'
import { success, error } from '../output.js'
import { connect, disconnect, tables, getItem, getItems, editItem, addItem, getCount } from '../../libs/db.js'
import { checkAuthorization } from '../../libs/token.js'
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
    // TODO: 첨부파일 삭제에 대한 대책이 없는데 방법을 찾아야 할것이다.
    // TODO: 첨부파일의 종류가 메인파일, 커버 원본, 커버 제작 세가지가 있다.
    // TODO: remove_files 값이 있으면 어떤 부분의 파일을 삭제해야 한다는 의미로 간주하고 작동한다. (main,cover-original,cover-create)
    try
    {
      const id = req.params.id
      if (!id) throw new ServiceError('id 값이 없습니다.')

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
      const asset = getItem({
        table: tables.asset,
        where: 'id = $id',
        values: { '$id': id },
      })
      if (!asset?.data) throw new ServiceError('에셋 데이터가 없습니다.')
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
      updateFile({
        file: newFileMain,
        map: srcMapFiles,
        fileType: fileTypes.main,
        assetId: id,
      })
      const fileCoverOriginal = req.files?.[uploadFields.coverOriginal]?.[0]
      updateFile({
        file: fileCoverOriginal,
        map: srcMapFiles,
        fileType: fileTypes.coverOriginal,
        assetId: id,
      })
      const fileCreate = req.files?.[uploadFields.coverCreate]?.[0]
      updateFile({
        file: fileCreate,
        map: srcMapFiles,
        fileType: fileTypes.coverCreate,
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
      console.error(e)
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
  if (!checkExistValueInObject(data, ['title', 'description', 'json'])) return
  editItem({
    table: tables.asset,
    where: 'id = $id',
    set: [
      data.title && 'title = $title',
      data.description && 'description = $description',
      data.json && 'json = $json',
      'updated_at = CURRENT_TIMESTAMP',
    ].filter(Boolean),
    values: {
      '$id': assetId,
      '$title': data.title,
      '$description': data.description,
      '$json': data.json,
    },
  })
}
