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
    const query = req.query || {}
    const id = Number(req.params.id)
    if (!id) throw new ServiceError('id 값이 없습니다.', 404)

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

    let { path, type } = file.data.path

    // TODO: 캐시데이터가 존재한가?
    //   TRUE)
    //   | 캐시 데이터에서 권한이 공개되어 있는가?
    //   | TRUE)
    //   | | END=> 캐시 데이터로 탈출한다.
    //   | FALSE)
    //   | | 쿠키에서 엑세스토큰을 가져와서 디코딩한다. (실패하면 403)
    //   | | 엑세스토큰 유저 아이디 = 캐시의 유저아이디 ?
    //   | | TRUE)
    //   | | | END=> 캐시 데이터로 탈출한다.
    //   | | FALSE)
    //   | | | END=> 권한이 없으므로 403
    //   FALSE)
    //   | 에셋-파일 매핑 테이블에서 조회한다. (없으면 403)
    //   | 얻은 에셋아이디로 퍼미션 테이블을 조회한다. (데이터가 없으면 403)
    //   | 퍼미션 데이터에서 public=1 ?
    //   | TRUE)
    //   | | 캐시 데이터를 만든다. (공개)
    //   | | END=> 탈출
    //   | FALSE)
    //   | | 쿠키에서 엑세스 토큰을 가져와서 디코딩한다. (실패하면 403)
    //   | | 엑세스토큰 유저 아이디 = 퍼미션 데이터 유저 아이디 ?
    //   | | TRUE)
    //   | | | END=> 캐시 데이터를 만들고 탈출 (비공개, 엑세스토큰 해시 추가)
    //   | | FALSE)
    //   | | | END=> 권한이 없으므로 403
    //   | | |

    // 파일 버퍼 데이터를 만든다.
    const buffer = await filePathToBuffer(path, {
      type,
      query,
    })

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
    console.error('FILE ERROR =>', e)
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

function createCache()
{
  // TODO: 캐시 데이터에서 들어가야할 필드
  //  - 파일 패스
  //  - 공개여부
  //  - 에셋 아이디
  //  - 유저 아이디
  //  - 엑세스 토큰
  //  - 파일 이름
  //  - 파일 타입
  //  - 파일 이미지 사이즈
}
