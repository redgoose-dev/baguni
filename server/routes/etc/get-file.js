/**
 * [GET] /file/:id/
 *
 * 파일 불러오기 (file 테이블 아이디로 사용하기)
 */

import { existsSync } from 'node:fs'
import { outFile, end } from '../output.js'
import { connect, disconnect, tables, getItem } from '../../libs/db.js'
import { checkAuthorization } from '../../libs/token.js'
import ServiceError from '../../libs/ServiceError.js'

export default async (req, res) => {
  try
  {
    const id = Number(req.params.id)
    if (!id) throw new ServiceError('id 값이 없습니다.', 404)

    // connect db
    connect({ readonly: true })
    // check auth
    checkAuthorization(req.headers.authorization, false)

    // get data
    const file = getItem({
      table: tables.file,
      where: 'id = $id',
      values: { '$id': id },
    })
    if (!file?.data) throw new ServiceError('파일 데이터가 없습니다.', 404)
    if (!existsSync(file.data?.path)) throw new ServiceError('파일이 없습니다.', 404)

    // convert path to buffer
    const data = Bun.file(file.data.path)
    let buffer = await data.arrayBuffer()
    buffer = Buffer.from(buffer)

    // close db
    disconnect()
    // result
    outFile(req, res, {
      type: file.data.type,
      buffer,
      _message: '파일 열기',
    })
  }
  catch (e)
  {
    // close db
    disconnect()
    // result
    end(req, res, 'error', {
      code: e.code || 500,
      message: '파일을 열지 못했습니다.',
      _file: __filename,
      _err: e,
    })
  }
}
