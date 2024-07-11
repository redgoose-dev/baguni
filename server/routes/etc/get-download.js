/**
 * [GET] /download/:id/
 *
 * 파일 다운로드 (file 테이블 아이디로 사용하기)
 * 정확한 이름으로 다운로드 할 수 있게한다.
 */

import { existsSync } from 'node:fs'
import { download, end } from '../output.js'
import { connect, disconnect, tables, getItem } from '../../libs/db.js'
import ServiceError from '../../libs/ServiceError.js'
import { getAccessTokenFromCookie } from '../../libs/token.js'

export default async (req, res) => {
  try
  {
    const id = Number(req.params.id)
    if (!id) throw new ServiceError('파일 ID 값이 없습니다.', 404)

    // connect db
    connect({ readonly: true })

    // get data
    const file = getItem({
      table: tables.file,
      where: 'id = $id',
      values: { '$id': id },
    })
    if (!file?.data) throw new ServiceError('파일 데이터가 없습니다.', 404)
    if (!existsSync(file.data.path)) throw new ServiceError('파일이 없습니다.', 404)

    // get owner data
    const owner = getItem({
      table: tables.owner,
      fields: [ `${tables.owner}.*` ],
      join: [ `join ${tables.mapAssetFile} on ${tables.mapAssetFile}.asset = ${tables.owner}.asset` ],
      where: `${tables.mapAssetFile}.file = $file`,
      values: { '$file': id },
    })
    if (!owner?.data) throw new ServiceError('소유자가 없습니다.')

    // 비공개일 경우
    if (owner.data?.public !== 1)
    {
      const decoded = getAccessTokenFromCookie(req)
      if (owner.data.user !== decoded.userId)
      {
        throw new ServiceError('권한이 없는 파일입니다.', 403)
      }
    }

    // close db
    disconnect()
    // result
    download(req, res, {
      path: file.data.path,
      name: file.data.name,
      _message: '파일 다운로드',
    })
  }
  catch (e)
  {
    // close db
    disconnect()
    // result
    end(req, res, 'error', {
      code: e.code || 500,
      message: '파일을 다운로드하지 못했습니다.',
      _file: __filename,
      _err: e,
    })
  }
}
