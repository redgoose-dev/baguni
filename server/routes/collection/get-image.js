/**
 * [GET] /image/:id/
 *
 * 이미지 출력
 */

import { existsSync } from 'node:fs'
import { outFile, end } from '../output.js'
import { connect, disconnect, tables, getItem } from '../../libs/db.js'
import { getAccessTokenFromCookie } from '../../libs/token.js'
import ServiceError from '../../libs/ServiceError.js'

export default async (req, res) => {
  try
  {
    const query = req.query || {}
    const id = Number(req.params.file)
    let output = {}
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
    if (!/^image/.test(file.data.type)) throw new ServiceError('이미지 파일이 아닙니다.', 404)

    // get owner data
    const owner = getItem({
      table: tables.owner,
      fields: [ `${tables.owner}.*` ],
      join: [ `join ${tables.mapCollectionFile} on ${tables.mapCollectionFile}.collection = ${tables.owner}.collection` ],
      where: `${tables.mapCollectionFile}.file = $file`,
      values: { '$file': id },
    })
    if (!owner?.data) throw new ServiceError('소유자가 없습니다.')

    // check owner id
    const decoded = getAccessTokenFromCookie(req)
    if (owner.data.user !== decoded.userId)
    {
      throw new ServiceError('권한이 없는 파일입니다.', 403)
    }

    // 파일 버퍼 데이터를 만든다.
    const buffer = await filePathToBuffer(file.data.path)

    // close db
    disconnect()
    // result
    outFile(req, res, {
      type: output.type,
      buffer,
      _message: '이미지 열기',
      useLog: false,
    })
  }
  catch (e)
  {
    // close db
    disconnect()
    // result
    end(req, res, 'error', {
      code: e.code || 500,
      message: '이미지를 열지 못했습니다.',
      _file: __filename,
      _err: e,
    })
  }
}

async function filePathToBuffer(path)
{
  let buffer
  // 일반 파일
  const data = Bun.file(path)
  buffer = await data.arrayBuffer()
  return Buffer.from(buffer)
}
