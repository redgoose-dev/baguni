import { sign, verify } from 'jsonwebtoken'
import { tables, getCount, getItem } from './db.js'
import ServiceError from './ServiceError.js'

const {
  ACCESS_TOKEN_SECRET,
  ACCESS_TOKEN_SECRET_EXPIRES,
  REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET_EXPIRES,
} = import.meta.env

/**
 * create token
 * @param {'access'|'refresh'} type
 * @param {object} payload
 * @return {object}
 */
export function createToken(type, payload = {})
{
  let secret, expires
  switch (type)
  {
    case 'access':
      secret = ACCESS_TOKEN_SECRET
      expires = ACCESS_TOKEN_SECRET_EXPIRES // 엑세스 토큰 만료시간
      break
    case 'refresh':
      secret = REFRESH_TOKEN_SECRET
      expires = REFRESH_TOKEN_SECRET_EXPIRES // 리프레시 토큰 만료시간
      break
    default:
      return null
  }
  const value = sign(payload, secret, {
    expiresIn: expires,
  })
  return {
    value,
    parse: decodeToken(type, value),
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
  switch (type)
  {
    case 'access':
      return verify(token, ACCESS_TOKEN_SECRET)
    case 'refresh':
      return verify(token, REFRESH_TOKEN_SECRET)
    default:
      return null
  }
}

/**
 * get token from header authorization
 * @param {any} req
 * @return {string}
 */
export function getTokenFromHeader(req)
{
  if (!req?.headers?.authorization) return undefined
  return req.headers.authorization.replace(/^Bearer /, '')
}

/**
 * check authorization
 * @param {string} authorization
 * @param {boolean} useUser
 * @return {object|void}
 */
export function checkAuthorization(authorization, useUser = true)
{
  try
  {
    if (!authorization) throw new Error('엑세스 토큰이 없습니다.')
    const token = authorization.replace(/^Bearer /, '')
    if (!token) throw new Error('엑세스 토큰이 없습니다.')
    // try decode token
    const decoded = decodeToken('access', token)
    if (!decoded.id) throw new Error('잘못된 엑세스토큰입니다.')
    // check if the data exists in the database
    const count = getCount({
      table: tables.tokens,
      where: 'access = $access',
      values: { '$access': token },
    }).data
    if (!(count > 0)) throw new Error('데이터베이스에 엑세스 토큰이 없습니다.')
    if (useUser)
    {
      const user = getItem({
        table: tables.user,
        fields: [ 'id', 'email', 'name', 'regdate' ],
        where: `id = $id`,
        values: { '$id': decoded.id },
      })
      if (!user?.data?.id) throw new Error('유저 정보가 없습니다.')
      return user.data
    }
  }
  catch (e)
  {
    throw new ServiceError(e.message, 401)
  }
}
