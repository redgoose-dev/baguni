/**
 * [PUT] /user/:id/
 *
 * Edit user data
 */

import { success, error } from '../output.js'
import { connect, disconnect, tables, editItem } from '../../libs/db.js'
import { checkAuthorization } from '../../libs/token.js'
import { parseJSON } from '../../libs/objects.js'
import { hashPassword, verifyEmail } from '../../libs/strings.js'
import ServiceError from '../../libs/ServiceError.js'

export default async (req, res) => {
  try
  {
    const id = Number(req.params.id)
    if (!id) throw new ServiceError('id 값이 없습니다.')

    let { email, name, json, newPassword, newPasswordConfirm } = req.body
    let readyUpdate = {
      email: undefined,
      name: undefined,
      password: undefined,
    }

    // connect db
    connect({ readwrite: true })
    // check auth
    const auth = checkAuthorization(req.headers.authorization)

    // check id (현재는 본인만 접근할 수 있도록 만들어두지만 나중에는 타인이 접근할 수 있을것이다.)
    if (auth.id !== id)
    {
      throw new ServiceError('토큰 아이디가 서로 다릅니다.', 401)
    }

    // update email
    if (email)
    {
      if (!verifyEmail(email))
      {
        throw new ServiceError('올바른 이메일 주소가 아닙니다.')
      }
      readyUpdate.email = email
    }

    // update name
    if (name)
    {
      readyUpdate.name = name.trim()
    }

    // update password
    if (newPassword && newPasswordConfirm)
    {
      if (newPassword !== newPasswordConfirm)
      {
        throw new ServiceError('새로운 비밀번호와 확인용 비밀번호가 다릅니다.')
      }
      readyUpdate.password = hashPassword(String(newPassword))
    }

    // update json
    if (json)
    {
      json = parseJSON(json) || {}
      readyUpdate.json = JSON.stringify(json)
    }

    // check ready update data
    if (!Object.values(readyUpdate).some(x => x !== undefined))
    {
      throw new ServiceError('업데이트할 데이터가 없습니다.')
    }

    // update data
    editItem({
      table: tables.user,
      where: 'id = $id',
      set: [
        readyUpdate.email && 'email = $email',
        readyUpdate.name && 'name = $name',
        readyUpdate.password && 'password = $password',
        readyUpdate.json && 'json = $json',
      ].filter(Boolean),
      values: {
        '$id': id,
        '$email': readyUpdate.email,
        '$name': readyUpdate.name,
        '$password': readyUpdate.password,
        '$json': readyUpdate.json,
      },
    })

    // close db
    disconnect()
    // result
    success(req, res, {
      message: '유저를 수정했습니다.',
    })
  }
  catch (e)
  {
    // close db
    disconnect()
    // result
    error(req, res, {
      code: e.code,
      message: '유저를 수정하지 못했습니다.',
      _file: __filename,
      _err: e,
    })
  }
}
