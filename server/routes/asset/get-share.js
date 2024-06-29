/**
 * [GET] /asset/:id/share/
 *
 * Get share code
 * 에셋 공유 코드를 가져온다. 공유 데이터가 없으면 데이터를 만든다.
 */

import { randomBytes } from 'node:crypto'
import { success, error } from '../output.js'
import { connect, disconnect, tables, getItem, getCount, addItem, } from '../../libs/db.js'
import { checkAuthorization } from '../../libs/token.js'
import { permissions } from '../../libs/consts.js'
import ServiceError from '../../libs/ServiceError.js'

export default async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (!id) throw new ServiceError('id 값이 없습니다.')

    // connect db
    connect({ readwrite: true })
    // check auth
    checkAuthorization(req.headers.authorization)

    // check asset data
    const assetCount = getCount({
      table: tables.asset,
      where: 'id = $id',
      values: {
        '$id': id,
      },
    })
    if (!assetCount?.data) throw new ServiceError('에셋이 없습니다.')

    // get share data
    const share = getItem({
      table: tables.share,
      where: 'asset = $asset',
      values: {
        '$asset': id,
      },
    })

    // make code
    let code, permission
    if (share.data)
    {
      // 데이터가 있으면 그걸로 코드를 가져온다.
      code = share.data.code
      permission = share.data.permission
    }
    else
    {
      // 데이터가 없으니 만든다.
      code = randomBytes(8).toString('hex')
      let newData = addItem({
        table: tables.share,
        values: [
          { key: 'code', value: code },
          { key: 'asset', value: id },
          { key: 'permission', value: permissions.PRIVATE },
          { key: 'regdate', valueName: 'CURRENT_TIMESTAMP', },
        ],
      })
      newData = getItem({
        table: tables.share,
        where: 'id = $id',
        values: { '$id': newData.data },
      })
      if (!newData?.data) throw new ServiceError('새로운 공유 데이터를 만드는데 실패했습니다.')
      code = newData.data.code
      permission = newData.data.permission
    }

    // close db
    disconnect()
    // result
    success(req, res, {
      message: '에셋 공유코드 가져오기',
      data: {
        code,
        permission,
      },
    })
  }
  catch (e)
  {
    // close db
    disconnect()
    // result
    switch (e.code)
    {
      case 204:
        success(req, res, {
          message: '에셋 공유코드를 데이터가 없습니다.',
          code: 204,
        })
        break
      default:
        error(req, res, {
          code: e.code,
          message: '에셋 공유코드를 가져오지 못했습니다.',
          _file: __filename,
          _err: e,
        })
        break
    }
  }
}
