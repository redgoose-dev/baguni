import { sign, verify } from 'jsonwebtoken'

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
