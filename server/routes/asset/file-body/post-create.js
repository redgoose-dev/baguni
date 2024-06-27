/**
 * [POST] /asset/:id/file-body/
 *
 * Add body file from asset
 * 바디용 파일을 추가한다.
 */

import multer from 'multer'
import { uploader } from '../../../libs/uploader.js'
import { uploadFields, fileTypes } from '../../../libs/consts.js'
import { success, error } from '../../output.js'
import { connect, disconnect, tables, addItem } from '../../../libs/db.js'
import { checkAuthorization } from '../../../libs/token.js'
import { addFileData, removeJunkFiles } from '../../../libs/service.js'
import ServiceError from '../../../libs/ServiceError.js'

export default async (req, res) => {
  const _uploader = uploader()
  const upload = multer(_uploader).fields([
    { name: uploadFields.file, maxCount: 1 },
  ])
  upload(req, res, async () => {
    try
    {
      const assetId = req.params.id

      // connect db
      connect({ readwrite: true })
      // check auth
      checkAuthorization(req.headers.authorization)

      // set file
      const file = req.files?.[uploadFields.file]?.[0]
      if (!file) throw new ServiceError('에셋 바디용 파일이 없습니다.')

      // add file
      addFile({
        file,
        fileType: fileTypes.body,
        assetId,
      })

      // close db
      disconnect()
      // result
      success(req, res, {
        message: '에셋 바디용 파일을 추가했습니다.',
        data: {
          assetId,
        },
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
        message: '에셋 바디용 파일을 추가하지 못했습니다.',
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
