/**
 * [POST] /login
 *
 * 로그인
 * @param {string} [req.body.email]
 * @param {string} [req.body.password]
 * @param {'true'|undefined} [req.body.save]
 */

import ServiceError from '../../classes/ServiceError.js'
import { pref } from '../../classes/Preference.js'
import { onRequest, onResponse, setResponse, checkFormData, getFormData } from '../../libs/service.js'
import { connect, disconnect, tables, getItem, addItem } from '../../libs/db.js'
import { createToken, jwtToToken } from '../../libs/token.js'
import * as cookie from '../../libs/cookie.js'
import { verifyPassword } from './_lib.js'

const { URL_PATH } = Bun.env

export default async (req, _ctx) => {

  let response

  // trigger request event
  await onRequest(req, _ctx)

  try
  {
    const body = await getFormData(req)
    const { id, password, save } = body
    const checkKey = checkFormData(body, [ 'id', 'password' ])
    if (checkKey)
    {
      throw new ServiceError('필수값을 입력해주세요.', {
        status: 400,
        text: `'${checkKey}' 값이 없습니다.`,
      })
    }

    // connect db
    connect({ readwrite: true })

    // get data
    const provider = getItem({
      table: tables.provider,
      where: 'user_id = $user_id',
      values: { '$user_id': id },
    }).data
    if (!provider) throw new ServiceError('계정이 없습니다.', { status: 401 })

    // check password
    const checkPassword = verifyPassword(password, provider.user_password)
    if (!checkPassword)
    {
      throw new ServiceError('비밀번호 인증 실패', { status: 401 })
    }

    // create tokens
    const tokens = {
      access: createToken('access', {
        id: provider.id,
        user_id: provider.user_id,
      }),
      refresh: createToken('refresh', {
        id: provider.id,
      }),
    }
    if (!tokens.refresh)
    {
      throw new ServiceError('리프레시 토큰을 만들 수 없습니다.')
    }

    // add data to database
    addItem({
      table: tables.tokens,
      values: [
        {
          key: 'refresh',
          value: tokens.refresh.value,
        },
        {
          key: 'access',
          value: tokens.access.value,
        },
        {
          key: 'expired',
          value: tokens.refresh.parse.exp,
        },
        {
          key: 'created_at',
          valueName: 'CURRENT_TIMESTAMP',
        },
      ],
    })

    // set public access token
    const publicAccessToken = jwtToToken(tokens.access.value)

    // save cookie
    const saveCookie = save?.toLowerCase() === 'true'
    cookie.save(
      req,
      'access',
      publicAccessToken,
      saveCookie ? tokens.access.parse.exp : undefined
    )
    cookie.save(
      req,
      'refresh',
      tokens.refresh.value,
      saveCookie ? tokens.refresh.parse.exp : undefined
    )

    // set response
    response = setResponse({
      message: '로그인 성공',
      data: {
        accessToken: publicAccessToken,
        refreshToken: tokens.refresh.value,
        account: {
          ...provider,
          user_password: undefined,
        },
        preference: {
          ...pref.output,
          version: pref.version,
        },
        url: URL_PATH,
      },
    })
  }
  catch (_e)
  {
    response = setResponse(new ServiceError('인증 실패', {
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
