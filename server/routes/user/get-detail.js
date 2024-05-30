/**
 * [GET] /user/:id/
 *
 * Get user detail
 */

import { success, error } from '../output.js'
import { connect, disconnect, tables, getItem } from '../../libs/db.js'
import { checkAuthorization } from '../../libs/token.js'
import { addLog } from '../../libs/log.js'
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

    // check id (현재는 본인만 접근할 수 있도록 만들어두지만 나중에는 타인이 접근할 수 있을것이다.)
    if (auth.id !== id)
    {
      throw new ServiceError('토큰 아이디가 서로 다릅니다.', 204)
    }

    // get data
    const user = getItem({
      table: tables.user,
      fields: [ 'id', 'email', 'name', 'regdate' ],
      where: 'id = $id',
      values: {
        '$id': id,
      },
    })
    if (!user.data) throw new ServiceError('유저 데이터가 없습니다.', 204)

    // close db
    disconnect()
    // result
    success(res, {
      message: '유저의 상세정보',
      data: {
        id: user.data.id,
        name: user.data.name,
        email: user.data.email,
        regdate: user.data.regdate,
      },
    })
  }
  catch (e)
  {
    // add log
    addLog({ mode: 'error', message: e.message })
    // close db
    disconnect()
    // result
    error(res, {
      code: e.code,
      message: '유저를 가져오지 못했습니다.',
    })
  }
}
