/**
 * [GET] /file/:id/
 *
 * 파일 불러오기 (file 테이블 아이디로 사용하기)
 */

import { existsSync } from 'node:fs'
import sharp from 'sharp'
import { outFile, end } from '../output.js'
import { connect, disconnect, tables, getItem } from '../../libs/db.js'
import { parseJSON } from '../../libs/objects.js'
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
    if (!id) throw new ServiceError('id 값이 없습니다.', 404)

    // connect db
    connect({ readonly: true })

    const cache = Bun.file(`${paths.cacheJson}/${id}.json`)
    if (await cache.exists())
    {
      // 파일 캐시파일이 있는경우
      // TODO: 캐시파일 삭제조건도 고민해봐야 한다.
      // TODO: 캐시파일이 존재할때
      //   | 캐시 데이터에서 권한이 공개되어 있는가?
      //   | TRUE)
      //   | | END=> 캐시 데이터를 output 값에다 넣어주고 탈출
      //   | FALSE)
      //   | | 쿠키에서 엑세스토큰을 가져와서 디코딩한다. (실패하면 403)
      //   | | 엑세스토큰 유저 아이디 = 캐시의 유저아이디 ?
      //   | | TRUE)
      //   | | | END=> 캐시 데이터를 output 값에다 넣어주고 탈출
      //   | | FALSE)
      //   | | | END=> 권한이 없으므로 403
      console.log('exist cache file')

      // TODO: 상황) 캐시데이터에서 파일 패스를 가져왔는데 막상 열어보니 파일이 없었다. 원본 데이터가 지워졌다는 의미가 된다.
      // TODO: 고민) 두가지가 있는데 일단 캐시파일은 삭제하고 오류로 빠지거나 캐시 데이터가 없는 상황에서 다시 시작한다. (다시 시도해본다는 의미다.)
    }
    else // TODO: 어쩌면 else 끊고 새로 if 처리해야할수도 있다.
    {
      // get file data
      const file = getItem({
        table: tables.file,
        where: 'id = $id',
        values: { '$id': id },
      })
      if (!file?.data) throw new ServiceError('파일 데이터가 없습니다.', 404)
      if (!existsSync(file.data?.path)) throw new ServiceError('파일이 없습니다.', 404)
      let { path, type, meta } = file.data
      meta = parseJSON(meta)

      // TODO: 작업중 임시로 정해둠
      output.path = path
      output.type = type
      output.mea = meta
      // TODO: 작업중 임시로 정해둠

      // 캐시파일이 없을때
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
        // await createCache()
        // TODO
        //   | | 캐시 데이터를 만든다. (공개)
        //   | | END=> output 값에 넣어주고 탈출
        await createCache({
          public: true,
          path: file.data.path,
          asset: owner.data.asset,
          user: owner.data.user,
          fileName: file.data.name,
          fileType: file.data.type,
          meta,
        })
      }
      else
      {
        const decoded = getAccessTokenFromCookie(req)
        if (owner.data.user === decoded.userId)
        {
          // TODO: END=> 캐시 데이터를 만들고, output 값에 넣어주고 탈출 (비공개, 엑세스토큰 해시 추가)
          await createCache({
            public: false,
            path: file.data.path,
            asset: owner.data.asset,
            user: owner.data.user,
            fileName: file.data.name,
            fileType: file.data.type,
            token: decoded.token,
            meta,
          })
        }
        else
        {
          throw new ServiceError('파일 소유자가 아닙니다.', 403)
        }
      }
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
      _message: '파일 열기',
      useLog: false,
    })
  }
  catch (e)
  {
    console.error('FILE ERROR =>', e.message)
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

async function createCache(options = {})
{
  // public: false,
  //   path: file.data.path,
  // asset: owner.data.asset,
  // user: owner.data.user,
  // fileName: file.data.name,
  // fileType: file.data.type,
  // token: decoded.token,
  console.log('createCache()', options)
  // TODO: 캐시 데이터에서 들어가야할 필드
  //  - 파일 패스
  //  - 공개여부
  //  - 에셋 아이디
  //  - 유저 아이디
  //  - 엑세스 토큰
  //  - 파일 이름
  //  - 파일 타입
  //  - 이미지 사이즈
  // TODO: 리턴 데이터 - 파일패스, 타입, 이미지사이즈
  // TODO: 저장되는 파일 이름도 고민해봐야한다. 다시 여는것과 유니크함도 생각해야할지도..

  // TODO: 캐시에서 파일 정보까지 다 들어가있는 현상에 대하여..
  // TODO: 캐시파일이 파일 패스랑 정보 다 들어가 있는 상태라면 파일 데이터가 변경 되었을때 수습이 힘들어 보인다.
  // TODO: 그래서 인증을 위한 값들만 보관하는것이 좋을거 같다. (에셋아이디, 유저 아이디, 토큰, 공개여부)

  // TODO: 상황) 에셋 공개를 해놓고 파일을 열어 캐시를 만들었다. 에셋 비공개로 바꿨다. 다시 파일을 열람하면 에셋이 공개되어 있는 상태로 열리게 될것이다. (버그)
  // TODO: 해결) 권한이 변경될때마다 캐시 파일들을 찾아서 삭제한다.
}
