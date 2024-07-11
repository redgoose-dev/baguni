/**
 * [DELETE] /asset/:id/file-body/:file/
 *
 * Delete body file from asset
 * 바디용 파일을 삭제한다.
 */

import { success, error } from '../../output.js'
import { connect, disconnect, tables, getItem, removeItem } from '../../../libs/db.js'
import { checkAuthorization } from '../../../libs/token.js'
import { removeFile, checkAssetOwner } from '../../../libs/service.js'
import { ownerModes } from '../../../../global/consts.js'
import ServiceError from '../../../libs/ServiceError.js'

export default async (req, res) => {
  try
  {
    const assetId = Number(req.params.id)
    const fileId = Number(req.params.file)
    if (!assetId) throw new ServiceError('에셋 id가 없습니다.', 500)
    if (!fileId) throw new ServiceError('파일 id가 없습니다.', 500)

    // connect db
    connect({ readwrite: true })
    // check auth
    const auth = checkAuthorization(req.headers.authorization)

    // check owner
    checkAssetOwner(ownerModes.ASSET, auth.id, assetId)

    // get file data
    const file = getItem({
      table: tables.file,
      where: `id = $id`,
      values: { '$id': fileId },
    })
    if (!file?.data) throw new ServiceError('파일 데이터가 없습니다.')

    // remove data
    if (file?.data?.path) removeFile(file.data.path)
    removeItem({
      table: tables.file,
      where: 'id = $id',
      values: { '$id': fileId },
    })
    removeItem({
      table: tables.mapAssetFile,
      where: 'file = $file',
      values: { '$file': fileId },
    })

    // close db
    disconnect()
    // result
    success(req, res, { message: '에셋 바디용 데이터를 삭제했습니다.' })
  }
  catch (e)
  {
    // close db
    disconnect()
    // result
    error(req, res, {
      code: e.code,
      message: '에셋 바디용 데이터을 삭제할 수 없습니다.',
      _file: __filename,
      _err: e,
    })
  }
}
