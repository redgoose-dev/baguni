/**
 * [GET] /file/:id/
 *
 * 파일 불러오기 (file 테이블 아이디로 사용하기)
 */

import { existsSync, rmSync } from 'node:fs'
import sharp from 'sharp'
import { outFile, end } from '../output.js'
import { connect, disconnect, tables, getItem } from '../../libs/db.js'
import { getAccessTokenFromCookie } from '../../libs/token.js'
import ServiceError from '../../libs/ServiceError.js'

const paths = {
  cache: 'data/cache',
  cacheJson: 'data/cache/json',
}

export default async (req, res) => {
  try
  {
    const query = req.query || {}
    const id = Number(req.params.id)
    let output = {}
    if (!id) throw new ServiceError('파일 ID 값이 없습니다.', 404)

    // connect db
    connect({ readonly: true })

    // 파일 캐시파일
    const cacheFile = Bun.file(makeCachePath(id))

    // 파일 캐시파일이 있는경우
    if (await cacheFile.exists())
    {
      const cache = await cacheFile.json()
      if (existsSync(cache.path))
      {
        if (cache.public)
        {
          // 공개 파일일 경우
          output.path = cache.path
          output.type = cache.type
        }
        else
        {
          // 비공개 파일일 경우
          const decoded = getAccessTokenFromCookie(req)
          if (cache.user === decoded.userId)
          {
            output.path = cache.path
            output.type = cache.type
          }
          else
          {
            // 권한에 문제가 있으니 오류로 출력한다.
            throw new ServiceError('권한이 없습니다.', 403)
          }
        }
      }
      else
      {
        // 문제가 있는 파일이라고 판단하여 삭제한다.
        deleteCache(id)
      }
    }

    // 캐시 파일이 없거나 어떤 사정으로 파일 불러오기 실패했을 경우
    if (!(output.path && output.type))
    {
      // get file data
      const file = getItem({
        table: tables.file,
        where: 'id = $id',
        values: { '$id': id },
      })
      if (!file?.data) throw new ServiceError('파일 데이터가 없습니다.', 404)
      if (!existsSync(file.data?.path)) throw new ServiceError('파일이 없습니다.', 404)
      let { path, type } = file.data
      // get owner data
      const owner = getItem({
        table: tables.owner,
        fields: [ `${tables.owner}.*` ],
        join: [ `join ${tables.mapAssetFile} on ${tables.mapAssetFile}.asset = ${tables.owner}.asset` ],
        where: `${tables.mapAssetFile}.file = $file`,
        values: { '$file': id },
      })
      if (!owner?.data) throw new ServiceError('소유자 데이터가 없습니다.', 403)
      if (owner.data.public === 1)
      {
        makeCache({
          public: true,
          id,
          path: file.data.path,
          asset: owner.data.asset,
          user: owner.data.user,
          fileName: file.data.name,
          fileType: file.data.type,
        }).then()
      }
      else
      {
        const decoded = getAccessTokenFromCookie(req)
        if (owner.data.user === decoded.userId)
        {
          makeCache({
            public: false,
            id,
            path: file.data.path,
            asset: owner.data.asset,
            user: owner.data.user,
            fileName: file.data.name,
            fileType: file.data.type,
          }).then()
        }
        else
        {
          throw new ServiceError('파일 소유자가 아닙니다.', 403)
        }
      }
      output.path = path
      output.type = type
    }

    // check output data
    if (!(output.path && output.path))
    {
      throw new ServiceError('파일 데이터가 없습니다.', 404)
    }

    // 파일 버퍼 데이터를 만든다.
    const buffer = await filePathToBuffer(output.path, {
      type: output.type,
      query,
    })

    // close db
    disconnect()
    // result
    outFile(req, res, {
      type: output.type,
      buffer,
      _message: '파일열기',
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

async function filePathToBuffer(path, { type, query })
{
  const { width, height } = query
  let buffer
  if (/^image/.test(type) && (width || height))
  {
    // 이미지 리사이즈
    buffer = await resizeImageFile(path, query)
  }
  else
  {
    // 일반 파일
    const data = Bun.file(path)
    buffer = await data.arrayBuffer()
    buffer = Buffer.from(buffer)
  }
  return buffer
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

function makeCachePath(id)
{
  return `${paths.cacheJson}/${id}.json`
}

async function makeCache(options = {})
{
  let output = {
    file: options.id,
    public: options.public,
    path: options.path,
    asset: options.asset,
    user: options.user,
    name: options.fileName,
    type: options.fileType,
  }
  const file = Bun.file(makeCachePath(options.id))
  await Bun.write(file, JSON.stringify(output, null, 2))
}

function deleteCache(id)
{
  rmSync(makeCachePath(id), { recursive: true })
}
