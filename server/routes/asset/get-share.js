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
    let code
    if (share.data)
    {
      // 데이터가 있으면 그걸로 코드를 가져온다.
      code = share.data.code
    }
    else
    {
      // 데이터가 없으니 만든다.
      code = randomBytes(8).toString('hex')
      addItem({
        table: tables.share,
        values: [
          { key: 'code', value: code },
          { key: 'asset', value: id },
          { key: 'permission', value: permissions.PUBLIC },
          { key: 'regdate', valueName: 'CURRENT_TIMESTAMP', },
        ],
      })
    }

    // close db
    disconnect()
    // result
    success(req, res, {
      message: '에셋 공유코드 가져오기',
      data: {
        code,
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
      message: '에셋 공유코드를 가져오지 못했습니다.',
      _file: e.code !== 204 ? __filename : undefined,
      _err: e,
    })
  }
}
