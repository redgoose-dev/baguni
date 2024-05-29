/**
 * [POST] /login
 *
 * 로그인
 * @param {string} [req.body.email]
 * @param {string} [req.body.password]
 * @param {'true'|undefined} [req.body.save]
 */

import { success, error } from '../output.js'
import { checkExistValue } from '../../libs/objects.js'
import { connect, disconnect, tables, getItem, addItem } from '../../libs/db.js'
import { verifyPassword } from '../../libs/strings.js'
import { createError } from '../../libs/error.js'
import { addLog } from '../../libs/log.js'
import { createToken } from '../../libs/token.js'
import { cookie } from '../../libs/consts.js'

export default async (req, res) => {
  try
  {
    // check value
    const checkKey = checkExistValue(req.body, [ 'email', 'password' ])
    if (checkKey) throw new Error(`There is no '${checkKey}' entry.`)
    // connect db
    connect({ readwrite: true })
    // get data
    const user = getItem({
      table: tables.user,
      where: 'email = $email',
      values: { '$email': req.body.email },
    }).data
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
    const tokens = {
      accessToken: createToken('access', {
        id: user.id,
        email: user.email,
      }),
      refreshToken: createToken('refresh', {
        id: user.id,
      }),
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
    addItem({
      table: tables.tokens,
      values: [
        {
          key: 'refresh',
          value: tokens.refreshToken.value,
        },
        {
          key: 'access',
          value: tokens.accessToken.value,
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
    const saveCookie = req.body.save?.toLowerCase() === 'true'
    res.cookie(`${cookie.prefix}-access`, tokens.accessToken.value, {
      ...cookie.options,
      expires: saveCookie ? new Date(tokens.accessToken.parse.exp * 1000) : undefined,
      secure: req.secure,
    })
    res.cookie(`${cookie.prefix}-refresh`, tokens.refreshToken.value, {
      ...cookie.options,
      expires: saveCookie ? new Date(tokens.refreshToken.parse.exp * 1000) : undefined,
      secure: req.secure,
    })
    disconnect()
    success(res, {
      message: '로그인 성공',
      data: {
        accessToken: tokens.accessToken.value,
        refreshToken: tokens.refreshToken.value,
        user: {
          ...user,
          password: undefined,
        },
      },
    })
  }
  catch (e)
  {
    addLog({ mode: 'error', message: e.message })
    error(res, {
      message: '인증 실패했습니다.',
      code: e.code,
    })
  }
}
