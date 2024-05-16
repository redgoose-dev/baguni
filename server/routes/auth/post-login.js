import { success, error } from '../output.js'
import { checkExistValue } from '../../libs/objects.js'
import { connect, disconnect, tables, getItem, addItem } from '../../libs/db.js'
import { verifyPassword } from '../../libs/strings.js'
import { createError } from '../../libs/error.js'
import { addLog } from '../../libs/log.js'
import { createToken } from '../../libs/token.js'
import { cookie } from '../../libs/consts.js'

/**
 * [POST] /login
 * @param {string} [req.body.email]
 * @param {string} [req.body.password]
 * @param {'true'|undefined} [req.body.save]
 */

export default async (req, res) => {
  try
  {
    // check value
    checkExistValue(req.body, [ 'email', 'password' ])
    // connect db
    connect({ readwrite: true })
    // get data
    const user = await getItem({
      table: tables.user,
      where: 'email = $email',
      values: { '$email': req.body.email },
    })
    if (!user)
    {
      addLog({
        mode: 'error',
        message: 'Not found user.',
      })
      throw createError('Authentication failed, please try again.', 401)
    }
    const checkPassword = verifyPassword(req.body.password, user.password)
    if (!checkPassword)
    {
      addLog({
        mode: 'error',
        message: 'Failed verify password.',
      })
      throw createError('Authentication failed, please try again.', 401)
    }
    // create tokens
    const payload = {
      id: user.id,
      email: user.email,
    }
    const tokens = {
      accessToken: createToken('access', payload),
      refreshToken: createToken('refresh', payload),
    }
    if (!tokens.refreshToken)
    {
      addLog({
        mode: 'error',
        message: '리프레시 토큰을 만들 수 없습니다.',
      })
      throw createError(undefined, 500)
    }
    // 리프레시 토큰을 데이터베이스에 추가
    await addItem({
      table: tables.tokens,
      values: [
        {
          key: 'token',
          value: tokens.refreshToken.value,
        },
        {
          key: 'expired',
          value: tokens.refreshToken.parse.exp,
        },
        {
          key: 'regdate',
          valueName: 'CURRENT_TIMESTAMP',
        },
      ],
    })
    // save cookie
    if (req.body.save?.toLowerCase() === 'true')
    {
      res.cookie(`${cookie.prefix}-access`, tokens.accessToken.value, {
        ...cookie.options,
        expires: new Date(tokens.accessToken.parse.exp * 1000),
        secure: req.secure,
        // maxAge: 1000 * 60 * 60 * 24 * 7
      })
      res.cookie(`${cookie.prefix}-refresh`, tokens.refreshToken, {
        ...cookie.options,
        expires: new Date(tokens.refreshToken.parse.exp * 1000),
        secure: req.secure,
        // maxAge: 1000 * 60 * 60 * 24 * 14,
      })
    }
    disconnect()
    success({
      res,
      message: 'login',
      data: {
        accessToken: tokens.accessToken.value,
        refreshToken: tokens.refreshToken.value,
      },
    })
  }
  catch (e)
  {
    addLog({ mode: 'error', message: e.message })
    error({
      res,
      message: '인증 실패했습니다.',
      code: e.code,
    })
  }
}
