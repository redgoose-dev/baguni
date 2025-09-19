/**
 * [PUT] /provider/
 *
 * 패스워드용 프로바이더 만들기
 */

import ServiceError from '../../classes/ServiceError.js'
import { onRequest, onResponse, setResponse, getFormData, checkFormData  } from '../../libs/service.js'
import { connect, disconnect, tables, getCount, addItem } from '../../libs/db.js'
import { checkAuthorization } from '../../libs/token.js'
import { verifyUrl } from '../../libs/strings.js'
import { PROVIDER_CODE, hashPassword, verifyId, verifyEmail } from './_lib.js'

export default async (req, _ctx) => {

  let response

  // trigger request event
  await onRequest(req, _ctx)

  try
  {
    // get body
    const body = await getFormData(req)
    let { id, name, email, avatar, password } = body

    // check body
    const checkKey = checkFormData(body, [ 'id', 'name', 'email', 'password' ])
    if (checkKey)
    {
      throw new ServiceError('필수값을 입력해주세요.', {
        status: 400,
        text: `'${checkKey}' 값이 없습니다.`,
      })
    }

    // connect db
    connect({ readwrite: true })

    // check auth
    const auth = checkAuthorization(req)

    // id 값 아이디 검사 (영문,숫자,_,-)
    if (!verifyId(id))
    {
      throw new ServiceError(`아이디는 영문,숫자,'_','-' 만 사용할 수 있습니다.`, { status: 400 })
    }

    // check exist user
    const _provider = getCount({
      table: tables.provider,
      where: 'code LIKE $code AND user_id LIKE $user_id',
      values: {
        '$code': PROVIDER_CODE.PASSWORD,
        '$user_id': id,
      },
    }).data
    if (_provider > 0)
    {
      throw new ServiceError('이미 존재하는 사용자 아이디입니다.', { status: 400 })
    }

    // 이메일 주소 검사
    if (!verifyEmail(email))
    {
      throw new ServiceError('올바른 이메일 주소가 아닙니다.', { status: 400 })
    }

    // 아바타 주소 검사
    if (avatar && !verifyUrl(avatar))
    {
      throw new ServiceError('올바른 아바타 주소가 아닙니다.', { status: 400 })
    }

    // add data
    const providerId = addItem({
      table: tables.provider,
      values: [
        { key: 'code', value: PROVIDER_CODE.PASSWORD },
        { key: 'user_id', value: id.trim() },
        { key: 'user_name', value: name.trim() },
        { key: 'user_avatar', value: avatar },
        { key: 'user_email', value: email },
        { key: 'user_password', value: hashPassword(String(password)) },
        { key: 'created_at', valueName: 'CURRENT_TIMESTAMP' },
      ],
    }).data

    // set response
    response = setResponse({
      message: '프로바이더를 추가했습니다.',
      data: {
        id: providerId,
      },
    })
  }
  catch (_e)
  {
    req.err = _e
    // set response
    response = setResponse(new ServiceError('프로바이더를 추가하지 못했습니다.', {
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
