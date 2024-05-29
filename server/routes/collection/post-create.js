/**
 * [POST] /collection
 *
 * Create collection
 */

import multer from 'multer'
import { uploader } from '../../libs/uploader.js'
import { uploadFields, fileTypes } from '../../libs/consts.js'
import { success, error } from '../output.js'
import { connect, disconnect, tables, addItem } from '../../libs/db.js'
import { checkAuthorization } from '../../libs/token.js'
import { addLog } from '../../libs/log.js'
import { filteringTitle } from '../../libs/strings.js'
import { addFileData, removeJunkFiles } from '../../libs/service.js'

export default async (req, res) => {
  const _uploader = uploader()
  const upload = multer(_uploader).fields([
    { name: uploadFields.coverOriginal, maxCount: 1 },
    { name: uploadFields.coverCreate, maxCount: 1 },
  ])
  upload(req, res, async () => {
    try
    {
      let { title, description } = req.body

      // connect db
      connect({ readwrite: true })
      // check auth
      checkAuthorization(req.headers.authorization)

      // filtering values
      if (title) title = filteringTitle(title)

      // add data in database
      const collectionId = addItem({
        table: tables.collection,
        values: [
          title && { key: 'title', value: title },
          description && { key: 'description', value: description },
          { key: 'regdate', valueName: 'CURRENT_TIMESTAMP' },
          { key: 'updated_at', valueName: 'CURRENT_TIMESTAMP' },
        ].filter(Boolean),
      })

      // add files
      const fileOriginal = req.files?.[uploadFields.coverOriginal]?.[0]
      const fileCreate = req.files?.[uploadFields.coverCreate]?.[0]
      if (fileOriginal)
      {
        addFile({
          file: fileOriginal,
          fileType: fileTypes.coverOriginal,
          collectionId: collectionId.data,
        })
      }
      if (fileCreate)
      {
        addFile({
          file: fileCreate,
          fileType: fileTypes.coverCreate,
          collectionId: collectionId.data,
        })
      }

      // close db
      disconnect()
      // result
      success(res, {
        message: '콜렉션을 만들었습니다.',
        data: {
          collectionId: collectionId.data,
        },
      })
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
        message: '콜렉션을 추가하지 못했습니다.',
        code: e.code,
      })
    }
  })
}

function addFile(options)
{
  const { file, fileType, collectionId } = options
  const id = addFileData(file)
  addItem({
    table: tables.mapCollectionFile,
    values: [
      { key: 'collection', value: collectionId },
      { key: 'file', value: id },
      { key: 'type', value: fileType },
    ],
  })
}
