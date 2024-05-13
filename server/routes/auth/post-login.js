import { success, error } from '../output.js'
import { checkExistValue } from '../../libs/objects.js'
import { db, connect, disconnect } from '../../libs/db.js'

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
    // TODO: 사용자 정보 가져오기
    // TODO: 비밀번호 검증하기
    // TODO: 토큰 만들기
    // TODO: 데이터베이스 닫기
    console.log(req.body)
    disconnect()
    success({
      res,
      message: 'login',
      data: {},
    })
  }
  catch (e)
  {
    error({
      res,
      message: e.message,
    })
  }
}
