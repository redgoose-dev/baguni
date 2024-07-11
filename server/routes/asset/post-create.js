/**
 * [POST] /asset
 *
 * Create asset
 * issue: https://github.com/redgoose-dev/baguni/issues/5
 */

import multer from 'multer'
import { uploader } from '../../libs/uploader.js'
import { uploadFields, fileTypes } from '../../libs/consts.js'
import { success, error } from '../output.js'
import { connect, disconnect, tables, addItem } from '../../libs/db.js'
import { checkAuthorization } from '../../libs/token.js'
import { parseJSON } from '../../libs/objects.js'
import { filteringTitle } from '../../libs/strings.js'
import { addTag, addFileData, removeJunkFiles } from '../../libs/service.js'

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

      // connect db
      connect({ readwrite: true })
      // check auth
      const auth = checkAuthorization(req.headers.authorization)

      // filtering values
      if (title) title = filteringTitle(title)

      // check and set json
      json = parseJSON(json) || {}
      json = JSON.stringify(json)

      // set files
      const fileMain = req.files?.[uploadFields.file]?.[0]
      const fileOriginal = req.files?.[uploadFields.coverOriginal]?.[0]
      const fileCreate = req.files?.[uploadFields.coverCreate]?.[0]

      // add data in database
      const assetId = addItem({
        table: tables.asset,
        values: [
          title && { key: 'title', value: title },
          description && { key: 'description', value: description },
          { key: 'type', value: fileMain?.mimetype || null },
          { key: 'json', value: json },
          { key: 'regdate', valueName: 'CURRENT_TIMESTAMP' },
          { key: 'updated_at', valueName: 'CURRENT_TIMESTAMP' },
        ].filter(Boolean),
      }).data

      // add owner
      addItem({
        table: tables.owner,
        values: [
          { key: 'user', value: auth.id },
          { key: 'asset', value: assetId },
        ],
      })

      // add files
      if (fileMain)
      {
        addFile({
          file: fileMain,
          fileType: fileTypes.main,
          assetId,
        })
      }
      if (fileOriginal)
      {
        addFile({
          file: fileOriginal,
          fileType: fileTypes.coverOriginal,
          assetId,
        })
      }
      if (fileCreate)
      {
        addFile({
          file: fileCreate,
          fileType: fileTypes.coverCreate,
          assetId,
        })
      }

      // add tag data
      if (tags)
      {
        tags.split(',').forEach(tag => addTag(tag, assetId))
      }

      // close db
      disconnect()
      // result
      success(req, res, {
        message: '에셋을 만들었습니다.',
        data: { assetId },
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
        message: '에셋을 추가하지 못했습니다.',
        _file: __filename,
        _err: e,
      })
    }
  })

}

function addFile(options)
{
  const { file, fileType, assetId } = options
  const id = addFileData(file)
  addItem({
    table: tables.mapAssetFile,
    values: [
      { key: 'asset', value: assetId },
      { key: 'file', value: id },
      { key: 'type', value: fileType },
    ],
  })
}
