/**
 * [POST] /logout
 *
 * 로그아웃
 */

import { success, error } from '../output.js'
import { connect, disconnect, tables, removeItem } from '../../libs/db.js'
import { getTokenFromHeader } from '../../libs/token.js'
import { cookie } from '../../libs/consts.js'

export default async (req, res) => {
  try
  {
    const accessToken = getTokenFromHeader(req)
    if (accessToken)
    {
      connect({ readwrite: true })
      removeItem({
        table: tables.tokens,
        where: 'access = $access',
        values: { '$access': accessToken },
      })
      disconnect()
    }
    // clear cookies
    const cookieOptions = { ...cookie.options, maxAge: 0 }
    res.cookie(`${cookie.prefix}-access`, '', cookieOptions)
    res.cookie(`${cookie.prefix}-refresh`, '', cookieOptions)
    // response
    success(req, res, {
      message: '로그아웃 성공',
    })
  }
  catch (e)
  {
    error(req, res, {
      code: e.code,
      message: '로그아웃 오류',
      _file: __filename,
      _err: e,
    })
  }
}
