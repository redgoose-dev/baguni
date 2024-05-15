import jwt from 'jsonwebtoken'

const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = import.meta.env

/**
 * create token
 * @param {'access'|'refresh'} type
 * @param {object} payload
 * @return {string|null}
 */
export function createToken(type, payload = {})
{
  let secret, expires
  switch (type)
  {
    case 'access':
      secret = ACCESS_TOKEN_SECRET
      expires = '1h'
      break
    case 'refresh':
      secret = REFRESH_TOKEN_SECRET
      expires = '3d'
      break
    default:
      return null
  }
  return jwt.sign(payload, secret, {
    expiresIn: expires,
  })
}


