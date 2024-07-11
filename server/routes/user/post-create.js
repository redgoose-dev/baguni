/**
 * [POST] /user
 *
 * Create user
 */

import { success, error } from '../output.js'
import { connect, disconnect, tables, addItem, getCount } from '../../libs/db.js'
import { userModes } from '../../../global/consts.js'
import { checkAuthorization } from '../../libs/token.js'
import { checkExistValueInObject } from '../../libs/objects.js'
import { hashPassword, verifyEmail } from '../../libs/strings.js'
import { userPreference } from '../../../global/defaults.js'
import ServiceError from '../../libs/ServiceError.js'

export default async (req, res) => {
  try
  {
    let { email, name, password, mode } = req.body

    // check body
    if (!checkExistValueInObject(req.body, [ 'email', 'name', 'password' ]))
    {
      throw new ServiceError('파라메터 값이 없습니다.')
    }

    // connect db
    connect({ readwrite: true })
    // check auth
    const auth = checkAuthorization(req.headers.authorization)

    // check admin
    if (auth.mode !== userModes.ADMIN)
    {
      throw new ServiceError('사용자가 관리자 권한이 없습니다.', 403)
    }

    // check exist user
    const count = getCount({
      table: tables.user,
      where: 'email = $email',
      values: { '$email': email },
    })
    if (count.data > 0) throw new ServiceError('이미 존재하는 사용자 이메일 주소입니다.')

    // verify email
    if (!verifyEmail(email))
    {
      throw new ServiceError('올바른 이메일 주소가 아닙니다.')
    }

    // check mode
    mode = Object.values(userModes).includes(mode?.toUpperCase()) ? mode.toUpperCase() : undefined

    // add data
    const userId = addItem({
      table: tables.user,
      values: [
        { key: 'email', value: email },
        { key: 'name', value: name.trim() },
        { key: 'password', value: hashPassword(String(password)) },
        { key: 'json', value: JSON.stringify(userPreference) },
        mode && { key: 'mode', value: mode },
        { key: 'regdate', valueName: 'CURRENT_TIMESTAMP' },
      ].filter(Boolean),
    })

    // close db
    disconnect()
    // result
    success(req, res, {
      message: '사용자를 추가했습니다.',
      data: {
        userId: userId.data,
      },
    })
  }
  catch (e)
  {
    // close db
    disconnect()
    // result
    error(req, res, {
      code: e.code,
      message: '사용자를 추가하지 못했습니다.',
      _file: __filename,
      _err: e,
    })
  }
}
