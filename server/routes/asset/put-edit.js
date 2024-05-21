/**
 * [PUT] /asset
 *
 * Edit asset
 * issue: https://github.com/redgoose-dev/baguni/issues/6
 */

import multer from 'multer'
import { uploader, removeJunkFiles, removeFiles } from '../../libs/uploader.js'
import { uploadFields } from '../../libs/consts.js'
import { success, error } from '../output.js'
import { connect, disconnect, tables, getItem, getItems, addItem, editItem, removeItem } from '../../libs/db.js'
import { checkAuthorization } from '../../libs/token.js'
import { addLog } from '../../libs/log.js'
import { parseJSON, compareArrays, checkExistValueInObject } from '../../libs/objects.js'
import { filteringTitle } from '../../libs/strings.js'
import { addTag, removeTag, editFile } from '../../libs/service.js'

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
      if (!id) throw new Error(`id 값이 없습니다.`)
      let { title, description, json, tags } = req.body
      let readyUpdate = {
        title: undefined,
        description: undefined,
        json: undefined,
        file: undefined,
        tags: undefined,
      }
      let deleteFiles = []

      // connect db
      connect({ readwrite: true })
      // check auth
      checkAuthorization(req.headers.authorization)

      // get item
      const raw = getItem({
        table: tables.asset,
        where: 'id = $id',
        values: { '$id': id },
      }).data
      if (!raw) throw new Error('No asset data.')
      raw.json = parseJSON(raw.json)

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
      // update file
      const newFile = req.files?.[uploadFields.file]?.[0]
      if (newFile)
      {
        readyUpdate.file = newFile
        const fileData = getItem({
          table: tables.file,
          fields: [ `${tables.file}.*` ],
          join: `${tables.mapAssetFile} on ${tables.file}.id = ${tables.mapAssetFile}.file`,
          where: `asset = $asset`,
          values: { '$asset': id },
        })
        deleteFiles.push(fileData.data?.path)
      }
      // update json
      const fileOriginal = req.files?.[uploadFields.coverOriginal]?.[0]
      const fileCreate = req.files?.[uploadFields.coverCreate]?.[0]
      if (json)
      {
        json = parseJSON(json) || {}
        // cover image start
        if (json.cover && fileOriginal)
        {
          json.cover.original = fileOriginal
          deleteFiles.push(raw.json?.cover?.original?.path)
        }
        if (json.cover && fileCreate)
        {
          json.cover.create = {
            ...json.cover.create,
            ...fileCreate,
          }
          deleteFiles.push(raw.json?.cover?.create?.path)
        }
        if (!json.cover)
        {
          // json.cover 데이터가 없으므로 새로 올라간 커버 이미지와 기존 커버 이미지 모두 삭제한다.
          deleteFiles.push(fileOriginal?.path)
          deleteFiles.push(fileCreate?.path)
          deleteFiles.push(raw.json?.cover?.original?.path)
          deleteFiles.push(raw.json?.cover?.create?.path)
        }
        // cover image end
        readyUpdate.json = JSON.stringify(json)
      }
      else
      {
        if (fileOriginal?.path) deleteFiles.push(fileOriginal.path)
        if (fileCreate?.path) deleteFiles.push(fileCreate.path)
      }
      // update tags
      if (typeof tags === 'string')
      {
        const tagsData = getItems({
          table: tables.tag,
          fields: [ `${tables.tag}.*` ],
          join: `${tables.mapAssetTag} on ${tables.tag}.id = ${tables.mapAssetTag}.tag`,
          where: `asset = $id`,
          values: { '$id': id },
        })
        const beforeTagsArray = tagsData.data.map(o => (o.name))
        const compare = compareArrays(beforeTagsArray, tags.split(','))
        readyUpdate.tags = (compare.added?.length > 0 || compare.removed?.length > 0) ? compare : undefined
      }

      // update data
      updateData(readyUpdate, id)
      // update file
      editFile(readyUpdate.file, id)
      // update tags
      updateTags(readyUpdate.tags, id)
      // delete files
      if (deleteFiles.length > 0) removeFiles(deleteFiles)

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
      // result
      error(res, {
        message: '에셋을 수정하지 못했습니다.',
        code: e.code,
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
