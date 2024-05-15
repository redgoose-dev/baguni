import { success, error } from '../output.js'
import { checkExistValue } from '../../libs/objects.js'
import { connect, disconnect, tables, getItem } from '../../libs/db.js'
import { verifyPassword } from '../../libs/strings.js'
import { createError } from '../../libs/error.js'
import { addLog } from '../../libs/log.js'
import { createToken } from '../../libs/token.js'

/**
 * [POST] /login
 */

export default async (req, res) => {

  try
  {
    // check value
    checkExistValue(req.body, [ 'email', 'password' ])
    // connect db
    connect({ readonly: true })
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
    const payload = {
      id: user.id,
      email: user.email,
    }
    const tokens = {
      accessToken: createToken('access', payload),
      refreshToken: createToken('refresh', payload),
    }
    // save cookie
    if (req.body.save?.toLowerCase() === 'true')
    {
      // TODO: 계정을 저장하기로 하는거라면 쿠키로 저장한다.
    }
    disconnect()
    success({
      res,
      message: 'login',
      data: {
        ...tokens,
      },
    })
  }
  catch (e)
  {
    addLog({ mode: 'error', message: e.message })
    error({
      res,
      message: e.message,
      code: e.code,
    })
  }
}
