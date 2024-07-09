/**
 * [PUT] /asset/:id/share/
 *
 * Edit share data
 * 에셋 공유 데이터를 수정한다.
 */

import { success, error } from '../output.js'
import { connect, disconnect, tables, getItem, getCount, editItem } from '../../libs/db.js'
import { checkAuthorization } from '../../libs/token.js'
import { permissions } from '../../libs/consts.js'
import { checkExistValue, checkExistValueInObject } from '../../libs/objects.js'
import ServiceError from '../../libs/ServiceError.js'

export default async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (!id) throw new ServiceError('에셋 ID 값이 없습니다.')

    // check body
    const checkKey = checkExistValue(req.body, [ 'permission' ])
    if (checkKey) throw new Error(`'${checkKey}' 항목이 없습니다.`)
    const { permission } = req.body

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
    if (!share.data) throw new ServiceError('에셋 공유 데이터가 없습니다.')

    // set ready update
    let readyUpdate = {
      permission: undefined,
    }

    // update permission
    if (permission)
    {
      switch (permission.toUpperCase())
      {
        case permissions.PUBLIC:
        case permissions.PRIVATE:
          readyUpdate.permission = permission.toUpperCase()
          break
      }
    }

    // update data
    if (checkExistValueInObject(readyUpdate, ['permission']))
    {
      editItem({
        table: tables.share,
        where: 'asset = $asset',
        set: [
          readyUpdate.permission && 'permission = $permission',
        ].filter(Boolean),
        values: {
          '$asset': id,
          '$permission': readyUpdate.permission,
        },
      })
      // TODO: 파일 아이디 목록 가져오기
      // TODO: 권한 테이블 업데이트 하거나 데이터 추가하기
    }
    else
    {
      throw new ServiceError('업데이트할 데이터가 없습니다.')
    }

    // close db
    disconnect()
    // result
    success(req, res, {
      message: '에셋 공유데이터를 수정했습니다.',
    })
  }
  catch (e)
  {
    // close db
    disconnect()
    // result
    error(req, res, {
      code: e.code,
      message: '에셋 공유 데이터를 수정하지 못했습니다.',
      _file: e.code !== 204 ? __filename : undefined,
      _err: e,
    })
  }
}
