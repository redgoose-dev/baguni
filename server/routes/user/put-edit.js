/**
 * [PUT] /user/:id/
 *
 * Edit user data
 */

import { success, error } from '../output.js'
import { connect, disconnect, tables, editItem } from '../../libs/db.js'
import { checkAuthorization } from '../../libs/token.js'
import { addLog } from '../../libs/log.js'
import ServiceError from '../../libs/ServiceError.js'

export default async (req, res) => {
  try
  {
    const id = Number(req.params.id)
    if (!id) throw new ServiceError('id 값이 없습니다.')

    let { name } = req.body
    let readyUpdate = {
      name: undefined,
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

    // update name
    if (name)
    {
      readyUpdate.name = name.trim()
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
        readyUpdate.name && 'name = $name',
      ].filter(Boolean),
      values: {
        '$id': id,
        '$name': readyUpdate.name,
      },
    })

    // close db
    disconnect()
    // result
    success(res, {
      message: '유저를 수정했습니다.',
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
      message: '유저를 수정하지 못했습니다.',
    })
  }
}
