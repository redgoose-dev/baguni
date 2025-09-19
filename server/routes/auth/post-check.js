/**
 * [POST] /check
 *
 * 인증 검사하기
 */

import ServiceError from '../../classes/ServiceError.js'
import { pref } from '../../classes/Preference.js'
import { onRequest, onResponse, setResponse } from '../../libs/service.js'
import { connect, disconnect, tables, getCount, getItem, editItem } from '../../libs/db.js'
import { createToken, decodeToken, jwtToToken } from '../../libs/token.js'
import * as cookie from '../../libs/cookie.js'
import { getProvider } from './_lib.js'

const { URL_PATH } = Bun.env

export default async (req, _ctx) => {

  let response

  // trigger request event
  await onRequest(req, _ctx)

  try
  {
    // connect db
    connect({ readwrite: true })

    // get tokens
    let accessToken = cookie.get(req, 'access')
    const refreshToken = cookie.get(req, 'refresh')
    if (!refreshToken)
    {
      throw new ServiceError('리프레시 토큰이 없습니다.', { status: 401 })
    }

    // get access token
    let token
    if (accessToken)
    {
      token = getItem({
        table: tables.tokens,
        fields: [ 'access' ],
        where: 'access LIKE $access',
        values: { '$access': `%${accessToken}` },
      }).data
      if (token?.access) accessToken = token.access
    }

    // 엑세스 토큰 파싱
    let parseAccessToken
    try
    {
      if (!accessToken) throw 'no access token'
      parseAccessToken = decodeToken('access', accessToken)
    }
    catch (_e)
    {
      const retryData = await retryGetToken({
        req,
        refreshToken,
      })
      accessToken = retryData?.accessToken
      parseAccessToken = retryData?.parsed
      if (!(accessToken && parseAccessToken))
      {
        throw new ServiceError('리프레시 토큰 오류', {
          status: 401,
          text: '리프레시 토큰으로 재시도 했으나 엑세스 토큰을 가져오지 못했습니다.',
        })
      }
    }

    // check access token in database
    if (!token)
    {
      const countToken = getCount({
        table: tables.tokens,
        where: 'access LIKE $access',
        values: { '$access': `%${accessToken}` },
      }).data
      if (!(countToken > 0))
      {
        throw new ServiceError('데이터베이스에 엑세스 토큰이 없습니다.', { status: 401 })
      }
    }

    // get provider
    const provider = getProvider(parseAccessToken.id)

    // set response
    response = setResponse({
      message: '인증검사 성공',
      data: {
        accessToken: jwtToToken(accessToken),
        account: provider,
        preference: {
          ...pref.output,
          version: pref.version,
        },
        url: URL_PATH,
      },
    })
  }
  catch (_e)
  {
    response = setResponse(new ServiceError('인증검사 실패', {
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

async function retryGetToken(src = {})
{
  const { req, refreshToken } = src

  // check refresh token in database
  const countToken = getCount({
    table: tables.tokens,
    where: 'refresh LIKE $refresh',
    values: { '$refresh': refreshToken },
  }).data
  if (!(countToken > 0))
  {
    throw new ServiceError('데이터베이스에 리프레시 토큰이 없습니다.', { status: 401 })
  }

  // parsing refresh token
  const parsed = decodeToken('refresh', refreshToken)
  const provider = getProvider(parsed.id)
  const newAccessToken = createToken('access', {
    id: provider.id,
    email: provider.user_id,
  })

  // update database item
  editItem({
    table: tables.tokens,
    set: [ 'access = $access' ],
    where: 'refresh LIKE $refresh',
    values: {
      '$access': newAccessToken.value,
      '$refresh': refreshToken,
    },
  })

  // update cookie
  cookie.save(req, 'access', jwtToToken(newAccessToken.value), newAccessToken.parse.exp)

  // parse access token
  const parseAccessToken = decodeToken('access', newAccessToken.value)

  return {
    accessToken: newAccessToken.value,
    parsed: parseAccessToken,
  }
}
