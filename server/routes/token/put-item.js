/**
 * [PUT] /token/
 *
 * Create token
 * @data {string} name 토큰을 설명하는 이름
 * @data {string} expires 만료기간 (1s, 1m, 1h, 1d, 1y)
 */

import ServiceError from '@/classes/ServiceError.js'
import { onRequest, onResponse, setResponse, getFormData } from '@/libs/service.js'
import { connect, disconnect, tables, addItem } from '@/libs/db.js'
import { checkAuthorization, createToken, jwtToToken } from '@/libs/token.js'
import { TOKEN_TYPE } from '@/libs/assets.js'

export default async (req, _ctx) => {

  let response

  // trigger request event
  await onRequest(req, _ctx)

  try
  {
    // get body
    let { name, expires } = await getFormData(req)

    // connect db
    connect({ readwrite: true })

    // check auth
    const auth = checkAuthorization(req)

    // create tokens
    const tokens = {
      access: createToken(TOKEN_TYPE.ACCESS, {
        id: auth.id,
        user_id: auth.user_id,
      }, { expires }),
      refresh: createToken(TOKEN_TYPE.REFRESH, {
        id: auth.id,
      }),
    }
    if (!tokens.refresh)
    {
      throw new ServiceError('리프레시 토큰을 만들 수 없습니다.')
    }

    // add data to database
    const _addItem = addItem({
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
          value: tokens.access.parse.exp,
        },
        {
          key: 'name',
          value: name || 'user',
        },
        {
          key: 'created_at',
          valueName: 'CURRENT_TIMESTAMP',
        },
      ],
    })

    // set public access token
    const publicAccessToken = jwtToToken(tokens.access.value)

    // set response
    response = setResponse({
      message: '토큰을 만들었습니다.',
      data: {
        id: _addItem.data,
        token: publicAccessToken,
      },
    })
  }
  catch (_e)
  {
    req.err = _e
    // set response
    response = setResponse(new ServiceError('토큰을 만들지 못했습니다.', {
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
