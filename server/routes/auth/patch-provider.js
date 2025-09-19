/**
 * [PATCH] /provider/:id/
 *
 * 프로바이더 수정
 */

import ServiceError from '../../classes/ServiceError.js'
import { onRequest, onResponse, setResponse, getFormData } from '../../libs/service.js'
import { connect, disconnect, tables, getCount, editItem } from '../../libs/db.js'
import { checkAuthorization } from '../../libs/token.js'
import { verifyUrl } from '../../libs/strings.js'
import { hashPassword, verifyEmail } from './_lib.js'

export default async (req, _ctx) => {

  let response

  // trigger request event
  await onRequest(req, _ctx)

  try
  {
    const id = Number(req.params.id)
    if (!id) throw new ServiceError('ID 값이 없습니다.', { status: 204 })

    // get body
    const body = await getFormData(req)
    let { name, email, avatar, password, password_confirm } = body
    let readyUpdate = {
      name: undefined,
      email: undefined,
      avatar: undefined,
      password: undefined,
    }

    // connect db
    connect({ readwrite: true })

    // check auth
    const auth = checkAuthorization(req)

    // check item
    const _provider = getCount({
      table: tables.provider,
      where: `id = ${id}`,
    }).data
    if (!(_provider > 0))
    {
      throw new ServiceError('프로바이더가 없습니다.', { status: 204 })
    }

    // update name
    if (name)
    {
      readyUpdate.name = name.trim()
    }

    // update email
    if (email)
    {
      if (!verifyEmail(email))
      {
        throw new ServiceError('올바른 이메일 주소가 아닙니다.', { status: 400 })
      }
      readyUpdate.email = email
    }

    // update avatar
    if (avatar)
    {
      if (!verifyUrl(avatar))
      {
        throw new ServiceError('올바른 아바타 주소가 아닙니다.', { status: 400 })
      }
      readyUpdate.avatar = avatar
    }

    // update password
    if (password && password_confirm)
    {
      if (password !== password_confirm)
      {
        throw new ServiceError('새로운 비밀번호와 확인용 비밀번호가 다릅니다.', { status: 400 })
      }
      readyUpdate.password = hashPassword(String(password))
    }

    // check ready update data
    if (!Object.values(readyUpdate).some(x => x !== undefined))
    {
      throw new ServiceError('업데이트할 데이터가 없습니다.', { status: 400 })
    }

    // update data
    editItem({
      table: tables.provider,
      where: 'id = $id',
      set: [
        readyUpdate.name && 'user_name = $name',
        readyUpdate.email && 'user_email = $email',
        readyUpdate.avatar && 'user_avatar = $avatar',
        readyUpdate.password && 'user_password = $password',
      ].filter(Boolean),
      values: {
        '$id': id,
        '$name': readyUpdate.name,
        '$email': readyUpdate.email,
        '$avatar': readyUpdate.avatar,
        '$password': readyUpdate.password,
      },
    })

    // set response
    response = setResponse({
      message: '프로바이더를 수정했습니다.',
    })
  }
  catch (_e)
  {
    req.err = _e
    // set response
    response = setResponse(new ServiceError('프로바이더를 수정하지 못했습니다.', {
      status: _e.status,
      text: _e.statusText || _e.message,
      url: `${req.method} ${req.url}`,
    }))
  }
  finally
  {
    disconnect()
  }

  // trigger response event
  await onResponse(req, response, _ctx)

  return response

}
