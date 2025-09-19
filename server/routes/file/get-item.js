/**
 * [GET] /file/:id/
 *
 * 파일 불러오기 (file 테이블 아이디로 사용하기)
 */

import sharp from 'sharp'
import ServiceError from '../../classes/ServiceError.js'
import { pref } from '../../classes/Preference.js'
import { getQuery } from '../../libs/server.js'
import { onRequest, onResponse, setResponse } from '../../libs/service.js'
import { connect, disconnect, tables, getItem } from '../../libs/db.js'
import { checkAuthorization, getToken } from '../../libs/token.js'
import { ASSET_MODE } from '../asset/_lib.js'
import { getCachePath } from './_lib.js'

const { DATA_PATH } = Bun.env

export default async (req, _ctx) => {

  let response

  // trigger request event
  await onRequest(req, _ctx)

  try
  {
    const query = getQuery(req.url)
    const id = Number(req.params.id)
    if (!id) throw new ServiceError('ID 값이 없습니다.', { status: 404 })

    // connect db
    connect({ readonly: true })

    // get cache file
    const cacheFile = Bun.file(getCachePath(id), { type: 'application/json' })

    let auth
    let output = { path: null, type: null }
    let _file

    // 파일 캐시파일이 있는경우
    if (await cacheFile.exists())
    {
      const cache = await cacheFile.json()
      _file = Bun.file(cache.path, { type: cache.type })
      if (await _file.exists())
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
          if (getToken(req) === cache.token)
          {
            output.path = cache.path
            output.type = cache.type
          }
          else
          {
            // 캐시에 붙어있는 토큰이 서로 달라서 캐시 파일은 삭제하고 인증검사
            await cacheFile.delete()
            if (!auth) auth = checkAuthorization(req)
          }
        }
      }
      else
      {
        // 문제가 있는 파일이라고 판단하여 캐시파일을 삭제한다.
        await cacheFile.delete()
      }
    }

    // 캐시 파일이 없거나 어떤 사정으로 파일 불러오기 실패했을 경우 새로운 캐시파일을 만들어본다.
    if (!(output.path && output.type))
    {
      // get file data
      let file = getItem({
        table: tables.file,
        where: `id = ${id}`,
      }).data
      if (!file)
      {
        throw new ServiceError('파일 데이터가 없습니다.', { status: 404 })
      }
      let asset
      if (file.module === tables.asset)
      {
        asset = getItem({
          table: tables.asset,
          fields: [ 'mode' ],
          where: `id = ${file.module_id}`,
        }).data
      }
      // 에셋이고 mode=private이라면? or 에셋이 아니라면? => 권한검사
      if (asset?.mode !== ASSET_MODE.PUBLIC)
      {
        auth = checkAuthorization(req)
      }
      _file = Bun.file(file.path, { type: file.type })
      if (!(await _file.exists()))
      {
        throw new ServiceError('파일이 없습니다.', { status: 404 })
      }
      // auth.accessToken
      const isPublic = asset?.mode === ASSET_MODE.PUBLIC
      // make cache file
      makeCacheFile({
        id,
        public: isPublic,
        path: file.path,
        module: file.module,
        module_id: file.module_id,
        fileName: file.name,
        fileType: file.type,
        token: !isPublic ? auth.accessToken : null,
      }).then()
      output.path = file.path
      output.type = file.type
    }

    // check output data
    if (!(output.path && output.type))
    {
      throw new ServiceError('파일 데이터가 없습니다.', {
        status: 404,
      })
    }

    // 버퍼 데이터를 만든다.
    let buffer
    if (_file)
    {
      buffer = await filePathToBuffer(_file, {
        type: output.type,
        query,
      })
    }
    else
    {
      const _file = Bun.file(output.path, { type: output.type })
      if (await _file.exists())
      {
        buffer = await filePathToBuffer(_file, {
          type: output.type,
          query,
        })
      }
      else
      {
        throw new ServiceError('파일이 없습니다.', { status: 404 })
      }
    }

    // set response
    response = setResponse(buffer, 200, {
      headers: {
        'Content-Type': output.type || 'application/octet-stream',
        'Cache-Control': `max-age=${pref.file.cacheMaxAge || 2592000}, public`,
      },
    })
  }
  catch (_e)
  {
    response = setResponse(new ServiceError('파일을 열지 못했습니다.', {
      status: _e.status,
      text: _e.statusText || _e.message,
      url: `${req.method} ${req.url}`,
    }))
  }
  finally
  {
    disconnect()
  }

  // trigger response event
  await onResponse(req, response, _ctx)

  return response

}

/**
 * make cache file
 * @param {object} op
 * @return {Promise<void>}
 */
async function makeCacheFile(op = {})
{
  const _output = {
    file: op.id,
    public: op.public,
    path: op.path,
    module: op.module,
    module_id: op.module_id,
    name: op.fileName,
    type: op.fileType,
  }
  if (op.token) _output.token = op.token
  const _file = Bun.file(getCachePath(op.id), { type: 'application/json' })
  await Bun.write(_file, JSON.stringify(_output, null, 2))
}

/**
 * file path to buffer
 * @param {BunFile} file
 * @param {object} options
 * @param {?string} options.type
 * @param {?object} options.query
 * @return {Promise<ArrayBuffer>}
 */
async function filePathToBuffer(file, { type, query })
{
  const { w, h } = query
  if (/^image/.test(type) && (w || h))
  {
    return await resizeImage(file, query)
  }
  else
  {
    return await file.arrayBuffer()
  }
}
async function resizeImage(file, options = {})
{
  const { w, h, t, q } = options
  const filePaths = file.name.replace(/^.\//, '').split('/')
  const op = {
    w: w ? Number(w) : undefined,
    h: h ? Number(h) : undefined,
    t: t || 'cover',
    q: q ? Number(q) : 85,
  }
  const _query = optionsToQuery(op)
  const _path = `${DATA_PATH}/cache/${filePaths[2]}/${filePaths[3]}${_query}`
  const _cacheFile = Bun.file(_path)
  if (await _cacheFile.exists())
  {
    return await _cacheFile.arrayBuffer()
  }
  else
  {
    const _resized = await sharp(await file.arrayBuffer())
      .resize({
        width: op.w,
        height: op.h,
        fit: op.t,
      })
      .keepMetadata()
      .webp({ quality: op.q })
      .toBuffer()
    const _buffer = _resized.buffer.slice(0)
    Bun.write(_path, _buffer).then()
    return _buffer
  }
}
function optionsToQuery(op = {})
{
  let query = []
  if (op.w) query.push(`w=${op.w}`)
  if (op.h) query.push(`h=${op.h}`)
  if (op.t) query.push(`t=${op.t}`)
  if (op.q) query.push(`q=${op.q}`)
  return query.length > 0 ? `__${query.join('&')}` : ''
}

// function imageResize()
// {
//   return new Promise((resolve, reject) => {
//
//   })
// }
