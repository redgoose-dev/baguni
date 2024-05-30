/**
 * [GET] /download/:id/
 *
 * 파일 다운로드 (file 테이블 아이디로 사용하기)
 * 정확한 이름으로 다운로드 할 수 있게한다.
 */

import { existsSync } from 'node:fs'
import { connect, disconnect, tables, getItem } from '../../libs/db.js'
import { checkAuthorization } from '../../libs/token.js'
import { addLog } from '../../libs/log.js'
import ServiceError from '../../libs/ServiceError.js'

export default async (req, res) => {
  try
  {
    const id = Number(req.params.id)
    if (!id) throw new ServiceError('id 값이 없습니다.', 404)

    // connect db
    connect({ readonly: true })
    // check auth
    checkAuthorization(req.headers.authorization)

    // get data
    const file = getItem({
      table: tables.file,
      where: 'id = $id',
      values: { '$id': id },
    })
    if (!file?.data) throw new ServiceError('파일 데이터가 없습니다.', 404)
    if (!existsSync(file.data.path)) throw new ServiceError('파일이 없습니다.', 404)

    // close db
    disconnect()
    // result
    res.download(file.data.path, file.data.name)
  }
  catch (e)
  {
    // add log
    addLog({ mode: 'error', message: e.message })
    // close db
    disconnect()
    // add log
    res.status(e.code).end()
  }
}
