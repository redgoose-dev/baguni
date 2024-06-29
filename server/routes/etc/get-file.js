/**
 * [GET] /file/:id/
 *
 * 파일 불러오기 (file 테이블 아이디로 사용하기)
 */

import { existsSync } from 'node:fs'
import sharp from 'sharp'
import { outFile, end } from '../output.js'
import { connect, disconnect, tables, getItem } from '../../libs/db.js'
import { checkAuthorization } from '../../libs/token.js'
import ServiceError from '../../libs/ServiceError.js'

export default async (req, res) => {
  try
  {
    const id = Number(req.params.id)
    if (!id) throw new ServiceError('id 값이 없습니다.', 404)
    const { width, height, type, quality } = req.query
    let buffer

    // connect db
    connect({ readonly: true })
    // check auth
    // checkAuthorization(req.headers.authorization, false)

    // get data
    const file = getItem({
      table: tables.file,
      where: 'id = $id',
      values: { '$id': id },
    })
    if (!file?.data) throw new ServiceError('파일 데이터가 없습니다.', 404)
    if (!existsSync(file.data?.path)) throw new ServiceError('파일이 없습니다.', 404)

    if (/^image/.test(file.data.type) && (width || height))
    {
      const paths = file.data.path.split('/')
      const options = {
        width: width ? Number(width) : undefined,
        height: height ? Number(height) : undefined,
        type: type || 'cover',
        quality: quality ? Number(quality) : 85,
      }
      const query = optionsToQuery(options)
      const cache = Bun.file(`data/cache/${paths[2]}/${paths[3]}${query}`)
      const existCache = await cache.exists()
      if (existCache)
      {
        buffer = await cache.arrayBuffer()
        buffer = Buffer.from(buffer)
      }
      else
      {
        const data = Bun.file(file.data.path)
        const dataBuffer = await data.arrayBuffer()
        buffer = await sharp(dataBuffer)
          .resize({
            width: options.width,
            height: options.height,
            fit: options.type,
          })
          .keepMetadata()
          .webp({
            quality: options.quality,
          })
          .toBuffer()
        await Bun.write(`data/cache/${paths[2]}/${paths[3]}${query}`, buffer)
      }
    }
    else
    {
      // convert path to buffer
      const data = Bun.file(file.data.path)
      buffer = await data.arrayBuffer()
      buffer = Buffer.from(buffer)
    }
    // close db
    disconnect()
    // result
    outFile(req, res, {
      type: file.data.type,
      buffer,
      _message: '파일 열기',
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
      message: '파일을 열지 못했습니다.',
      _file: __filename,
      _err: e,
    })
  }
}

function optionsToQuery(op = {})
{
  let query = []
  if (op.width) query.push(`w=${op.width}`)
  if (op.height) query.push(`h=${op.height}`)
  if (op.type) query.push(`t=${op.type}`)
  if (op.quality) query.push(`q=${op.quality}`)
  return query.length > 0 ? `__${query.join('&')}` : ''
}
