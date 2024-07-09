/**
 * [GET] /file/:id/
 *
 * 파일 불러오기 (file 테이블 아이디로 사용하기)
 */

import { existsSync } from 'node:fs'
import sharp from 'sharp'
import { outFile, end } from '../output.js'
import { connect, disconnect, tables, getItem } from '../../libs/db.js'
import ServiceError from '../../libs/ServiceError.js'

const paths = {
  cache: 'data/cache',
  json: 'data/cache/json',
}

export default async (req, res) => {
  try
  {
    const id = Number(req.params.id)
    if (!id) throw new ServiceError('id 값이 없습니다.', 404)
    const { width, height, type, quality } = req.query
    let buffer

    // connect db
    connect({ readonly: true })

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
      // 이미지 리사이즈용
      buffer = await resizeImageFile(file.data.path, {
        ...req.query,
      })
    }
    else
    {
      // 일반 파일
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
    console.error(e)
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

async function resizeImageFile(path, options)
{
  const { width, height, type, quality } = options
  const filePaths = path.split('/')
  let buffer
  const op = {
    width: width ? Number(width) : undefined,
    height: height ? Number(height) : undefined,
    type: type || 'cover',
    quality: quality ? Number(quality) : 85,
  }
  const query = optionsToQuery(op)
  const cache = Bun.file(`${paths.cache}/${filePaths[2]}/${filePaths[3]}${query}`)
  const existCache = await cache.exists()
  if (existCache)
  {
    buffer = await cache.arrayBuffer()
    buffer = Buffer.from(buffer)
  }
  else
  {
    const data = Bun.file(path)
    const dataBuffer = await data.arrayBuffer()
    buffer = await sharp(dataBuffer)
      .resize({
        width: op.width,
        height: op.height,
        fit: op.type,
      })
      .keepMetadata()
      .webp({
        quality: op.quality,
      })
      .toBuffer()
    await Bun.write(`${paths.cache}/${filePaths[2]}/${filePaths[3]}${query}`, buffer)
  }
  return buffer
}
