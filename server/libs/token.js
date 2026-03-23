import { sign, verify } from 'jsonwebtoken'
import ServiceError from '../classes/ServiceError.js'
import { pref } from '../classes/Preference.js'
import { getQuery } from './server.js'
import { tables, getItem } from './db.js'

/**
 * create token
 * @param {'access'|'refresh'} type
 * @param {object} payload
 * @param {object} options
 * @return {object}
 */
export function createToken(type, payload = {}, options = {})
{
  let secret, expires
  switch (type)
  {
    case 'access':
      secret = pref._token.accessSecret
      expires = options?.expires || pref._token.accessExpires // 엑세스 토큰 만료시간
      break
    case 'refresh':
      secret = pref._token.refreshSecret
      expires = options?.expires || pref._token.refreshExpires // 리프레시 토큰 만료시간
      break
    default:
      return null
  }
  const value = sign(payload, secret, {
    expiresIn: expires,
  })
  const parse = decodeToken(type, value)
  if (!parse) throw new Error('Failed parse token')
  return {
    value,
    parse,
  }
}

/**
 * decode token
 * @param {'access'|'refresh'} type
 * @param {string} token
 * @return {object|null}
 */
export function decodeToken(type, token)
{
  try
  {
    switch (type)
    {
      case 'access':
        return verify(token, pref._token.accessSecret)
      case 'refresh':
        return verify(token, pref._token.refreshSecret)
    }
  }
  catch (_) {}
  return null
}

/**
 * get token
 * Request 객체에서 토큰값을 가져온다.
 *
 * @param {Request} req
 * @return {string|null}
 */
export function getToken(req)
{
  return req.headers.get('authorization') || getQuery(req.url, '_a')
}

/**
 * check authorization
 * 헤더에 `authorization`값이 없으면 쿼리스트링 `_a`에서 토큰을 찾아본다.
 * @param {Request} req
 * @param {boolean} useProvider
 * @return {object}
 */
export function checkAuthorization(req, useProvider = true)
{
  try
  {
    const authorization = getToken(req)
    if (!authorization) throw new Error('엑세스 토큰이 없습니다.')
    // check if the data exists in the database
    const token = getItem({
      table: tables.tokens,
      where: 'access LIKE $access',
      values: { '$access': `%${authorization}` },
    }).data
    if (!token) throw new Error('데이터베이스에 엑세스 토큰이 없습니다.')
    if (!token.expired) throw new Error('사용할 수 없는 토큰입니다.')
    // try decode token
    const decoded = decodeToken('access', token.access)
    if (!decoded?.id) throw new Error('잘못된 엑세스토큰입니다.')
    if (useProvider)
    {
      const provider = getItem({
        table: tables.provider,
        fields: [ 'id', 'user_id', 'user_email', 'user_name', 'user_avatar', 'created_at' ],
        where: `id = $id`,
        values: { '$id': decoded.id },
      }).data
      if (!provider?.id) throw new Error('계정 정보가 없습니다.')
      return {
        ...provider,
        accessToken: authorization,
      }
    }
    else
    {
      return {
        id: decoded.id,
        email: decoded.email,
        accessToken: authorization,
      }
    }
  }
  catch (_e)
  {
    throw new ServiceError(_e.message, {
      status: 401,
      text: _e.message,
      file: __filename,
    })
  }
}

/**
 * get token from jwt
 * @param {string} jwt
 * @return {string}
 */
export function jwtToToken(jwt)
{
  return jwt.split('.')[2].slice(-32)
}
