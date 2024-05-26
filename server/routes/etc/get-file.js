/**
 * [GET] /file
 */

import { existsSync } from 'node:fs'
import { connect, disconnect, tables, getItem } from '../../libs/db.js'
import { checkAuthorization } from '../../libs/token.js'
import ServiceError from '../../libs/ServiceError.js'

const {} = import.meta.env

export default async (req, res) => {
  try
  {
    const id = Number(req.params.id)
    let err
    if (!id) throw new ServiceError('id 값이 없습니다.', 204)
    // connect db
    connect({ readwrite: true })
    // check auth
    checkAuthorization(req.headers.authorization)

    // get data
    const file = getItem({
      table: tables.file,
      where: 'id = $id',
      values: { '$id': id },
    }).data
    if (!file) throw new ServiceError('파일 데이터가 없습니다.', 204)
    if (!existsSync(file.path)) throw new ServiceError('파일이 없습니다.', 204)

    // convert path to buffer
    const data = Bun.file(file.path)
    let buffer = await data.arrayBuffer()
    buffer = Buffer.from(buffer)

    // close db
    disconnect()
    // result
    res.writeHead(200, { 'Content-Type': file.type })
    res.end(buffer)
  }
  catch (e)
  {
    // add log
    res.status(404).end()
  }
}
