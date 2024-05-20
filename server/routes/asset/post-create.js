/**
 * [POST] /asset
 * issue: https://github.com/redgoose-dev/baguni/issues/5
 */

import multer from 'multer'
import { existsSync, rmSync } from 'node:fs'
import { uploader, removeJunkFiles } from '../../libs/uploader.js'
import { uploadFields } from '../../libs/consts.js'
import { success, error } from '../output.js'
import { connect, disconnect, tables, addItem, getItem } from '../../libs/db.js'
import { checkAuthorization } from '../../libs/token.js'
import { addLog } from '../../libs/log.js'
import { parseJSON } from '../../libs/objects.js'
import { filteringTitle } from '../../libs/strings.js'

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
      let { title, description, json, tags } = req.body
      let ids = {}

      // check value
      const newFile = req.files?.[uploadFields.file]?.[0]
      if (!newFile) throw new Error('파일이 없습니다.')
      // connect db
      connect({ readwrite: true })
      // check auth
      checkAuthorization(req.headers.authorization)

      // filtering values
      if (title) title = filteringTitle(title)
      // check and set json
      json = parseJSON(json) || {}
      // set cover data
      let jsonResult = convertCoverData({ ...json }, req.files)
      if (jsonResult.isUpdate) json = jsonResult.json
      json = JSON.stringify(json)

      // add data in database
      ids.asset = addItem({
        table: tables.asset,
        values: [
          title && { key: 'title', value: title },
          description && { key: 'description', value: description },
          { key: 'json', value: json },
          { key: 'regdate', valueName: 'CURRENT_TIMESTAMP' },
          { key: 'updated_at', valueName: 'CURRENT_TIMESTAMP' },
        ].filter(Boolean),
      }).data
      // add file data
      if (newFile)
      {
        ids.file = addItem({
          table: tables.file,
          values: [
            { key: 'path', value: newFile.path },
            { key: 'meta', value: JSON.stringify(newFile) },
            { key: 'regdate', valueName: 'CURRENT_TIMESTAMP' },
            { key: 'updated_at', valueName: 'CURRENT_TIMESTAMP' },
          ].filter(Boolean),
        }).data
        ids.assetFile = addItem({
          table: tables.mapAssetFile,
          values: [
            { key: 'asset', value: ids.asset },
            { key: 'file', value: ids.file },
          ],
        }).data
      }
      // add tag data
      if (tags)
      {
        tags.split(',').forEach(tag => addTagData(tag.trim(), ids))
      }
      // close db
      disconnect()
      // result
      success(res, {
        message: '에셋을 만들었습니다.',
        data: {
          assetID: ids.asset,
        },
      })
    }
    catch (e)
    {
      // 이미 업로드한 파일들은 전부 삭제한다.
      removeJunkFiles(req.files)
      // add log
      addLog({ mode: 'error', message: e.message })
      // result
      error(res, {
        message: '에셋을 추가하지 못했습니다.',
        code: e.code,
      })
    }
  })
}

/**
 * 커버 이미지용으로 json 값을 편집한다.
 * @param {object} json
 * @param {object} files
 * @return {object}
 */
export function convertCoverData(json, files)
{
  const fileOriginal = files[uploadFields.coverOriginal]?.[0]
  const fileCreate = files[uploadFields.coverCreate]?.[0]
  let isUpdate = false
  if (json?.cover && fileOriginal && fileCreate)
  {
    let { cover } = json
    cover.original = fileOriginal
    cover.create = {
      ...cover.create,
      path: fileCreate?.path
    }
    isUpdate = true
  }
  else
  {
    if (fileOriginal?.path && existsSync(fileOriginal.path))
    {
      rmSync(fileOriginal.path)
    }
    if (fileCreate?.path && existsSync(fileCreate.path))
    {
      rmSync(fileCreate.path)
    }
  }
  return {
    json,
    isUpdate,
  }
}

function addTagData(value, ids)
{
  const tag = getItem({
    table: tables.tag,
    fields: [ 'id' ],
    where: 'name like $name',
    values: { '$name': value },
  }).data
  let tagId = tag?.id
  if (!tagId)
  {
    try
    {
      tagId = addItem({
        table: tables.tag,
        values: [{ key: 'name', value: value }],
      }).data
    }
    catch (e)
    {}
  }
  if (tagId)
  {
    addItem({
      table: tables.mapAssetTag,
      values: [
        { key: 'asset', value: ids.asset },
        { key: 'tag', value: tagId },
      ],
    })
  }
}
