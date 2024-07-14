/**
 * [GET] /user/:id/
 *
 * Get user detail
 */

import { success, error } from '../output.js'
import { connect, disconnect, tables, getItem } from '../../libs/db.js'
import { checkAuthorization } from '../../libs/token.js'
import { userModes } from '../../../global/consts.js'
import ServiceError from '../../libs/ServiceError.js'

export default async (req, res) => {
  try
  {
    const id = Number(req.params.id)
    if (!id) throw new ServiceError('id 값이 없습니다.', 204)
    // connect db
    connect({ readwrite: true })
    // check auth
    const auth = checkAuthorization(req.headers.authorization)

    // 본인인지 검사 (관리자가 아니라면..)
    if (auth.mode !== userModes.ADMIN && auth?.id !== id)
    {
      throw new ServiceError('토큰 아이디가 서로 다릅니다.', 204)
    }

    // get data
    const user = getItem({
      table: tables.user,
      fields: [ 'id', 'email', 'name', 'mode', 'regdate' ],
      where: 'id = $id',
      values: {
        '$id': id,
      },
    })
    if (!user.data) throw new ServiceError('계정 데이터가 없습니다.', 204)

    // close db
    disconnect()
    // result
    success(req, res, {
      message: '계정 상세정보',
      data: {
        id: user.data.id,
        name: user.data.name,
        email: user.data.email,
        mode: user.data.mode,
        regdate: user.data.regdate,
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
      message: '계정을 가져오지 못했습니다.',
      _file: e.code !== 204 ? __filename : undefined,
      _err: e,
    })
  }
}
