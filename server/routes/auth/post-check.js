/**
 * [POST] /check
 */

import { success } from '../output.js'
import { connect, disconnect, tables, getItem, getCount, editItem } from '../../libs/db.js'
import { addLog } from '../../libs/log.js'
import { cookie } from '../../libs/consts.js'
import { createToken, decodeToken } from '../../libs/token.js'

export default async (req, res) => {
  function output(op)
  {
    disconnect()
    success(res, op)
  }
  function getUser(id)
  {
    const user = getItem({
      table: tables.user,
      where: 'id = $id',
      values: { '$id': id },
    })
    return {
      ...user,
      password: undefined,
    }
  }

  try
  {
    connect({ readwrite: true })
    // get tokens
    const accessToken = req.cookies[`${cookie.prefix}-access`]
    const refreshToken = req.cookies[`${cookie.prefix}-refresh`]
    if (!refreshToken) throw new Error()
    try
    {
      if (!accessToken) throw new Error('no access token')
      // 엑세스 토큰 파싱
      const parseAccessToken = decodeToken('access', accessToken)
      // check refresh token in database
      const countToken = getCount({
        table: tables.tokens,
        where: 'access = $access',
        values: { '$access': accessToken },
      })
      if (!(countToken > 0)) throw '데이터베이스에 엑세스 토큰이 없습니다.'
      // get user
      const user = getUser(parseAccessToken.id)
      // run response
      return output({
        message: '인증검사 성공',
        data: {
          accessToken,
          user,
        },
      })
    }
    catch (e)
    {
      // `e`가 문자로 되어있다면 완전히 빠져나가고, Error 객체라면 다음 과정으로 넘어간다.
      if (typeof e === 'string')
      {
        throw new Error(e)
      }
    }
    // 여기서부터는 리프레시 토큰으로 엑세스 토큰 재발급받는 과정이다.
    try
    {
      // check refresh token in database
      const countToken = getCount({
        table: tables.tokens,
        where: 'refresh = $refresh',
        values: { '$refresh': refreshToken },
      })
      if (!(countToken > 0)) throw new Error('데이터베이스에 리프레시 토큰이 없습니다.')
      // 리프레시 토큰 파싱
      const parseRefreshToken = decodeToken('refresh', refreshToken)
      const user = getUser(parseRefreshToken.id)
      const newAccessToken = createToken('access', {
        id: user.id,
        email: user.email,
      })
      // update database item
      editItem({
        table: tables.tokens,
        set: 'access = $access',
        where: 'refresh = $refresh',
        values: {
          '$access': newAccessToken.value,
          '$refresh': refreshToken,
        },
      })
      // update cookie
      res.cookie(`${cookie.prefix}-access`, newAccessToken.value, {
        ...cookie.options,
        expires: new Date(newAccessToken.parse.exp * 1000),
        secure: req.secure,
      })
      // run response
      return output({
        message: '인증검사 성공',
        data: {
          accessToken: newAccessToken.value,
          user,
        },
      })
    }
    catch (e)
    {
      throw new Error(e.message)
    }
  }
  catch (e)
  {
    if (e.message) addLog({ mode: 'error', message: e.message })
    success(res, {
      message: '인증하지 못했습니다.',
      data: undefined,
    })
  }
}
