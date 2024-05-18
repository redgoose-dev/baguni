import { success, error } from '../output.js'
import { connect, disconnect, tables, removeItem } from '../../libs/db.js'
import { addLog } from '../../libs/log.js'
import { getTokenFromHeader } from '../../libs/token.js'
import { cookie } from '../../libs/consts.js'

/**
 * [POST] /logout
 */

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
    success(res)
  }
  catch (e)
  {
    addLog({ mode: 'error', message: e.message })
    error(res, {
      message: '로그아웃 오류',
      code: e.code,
    })
  }
}
