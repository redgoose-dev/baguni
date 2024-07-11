/**
 * [PUT] /asset/:id/owner/
 *
 * Edit owner data
 * 소유자나 권한을 수정한다.
 */

import { success, error } from '../output.js'
import { connect, disconnect, tables, getItems, getItem, getCount, editItem } from '../../libs/db.js'
import { checkAuthorization } from '../../libs/token.js'
import { permissions } from '../../libs/consts.js'
import { checkAssetOwner, removeFile } from '../../libs/service.js'
import { ownerModes } from '../../../global/consts.js'
import ServiceError from '../../libs/ServiceError.js'

export default async (req, res) => {
  try
  {
    const id = Number(req.params.id)
    if (!id) throw new ServiceError('에셋 ID 값이 없습니다.')
    const { user, permission } = req.body

    // connect db
    connect({ readwrite: true })
    // check auth
    const auth = checkAuthorization(req.headers.authorization)

    // check owner
    checkAssetOwner(ownerModes.ASSET, auth.id, id)

    // check asset data
    const assetCount = getCount({
      table: tables.asset,
      where: 'id = $id',
      values: { '$id': id },
    })
    if (!assetCount?.data) throw new ServiceError('에셋이 없습니다.')

    // get share data
    const owner = getItem({
      table: tables.owner,
      where: 'asset = $asset',
      values: { '$asset': id },
    })
    if (!owner.data) throw new ServiceError('에셋 소유자 데이터가 없습니다.')

    // set ready update
    let readyUpdate = {
      user: undefined,
      public: undefined,
    }

    // update user
    if (user)
    {
      const userCount = getCount({
        table: tables.user,
        where: `id = $id`,
        values: {
          '$id': Number(user),
        },
      })
      if (!(userCount.data > 0)) throw new ServiceError('user 값은 없는 사용자입니다.')
      readyUpdate.user = Number(user)
    }
    // update permission
    if (permission)
    {
      switch (permission.toUpperCase())
      {
        case permissions.PUBLIC:
          readyUpdate.public = 1
          break
        case permissions.PRIVATE:
          readyUpdate.public = 0
          break
      }
    }

    // update data
    if (Object.values(readyUpdate).some(o => (o !== undefined)))
    {
      editItem({
        table: tables.owner,
        where: `asset = $asset`,
        set: [
          readyUpdate.public !== undefined && `public = $public`,
          readyUpdate.user !== undefined && `user = $user`,
        ].filter(Boolean),
        values: {
          '$asset': id,
          '$public': readyUpdate.public,
          '$user': readyUpdate.user,
        },
      })
      const files = getItems({
        table: tables.mapAssetFile,
        where: 'asset = $asset',
        values: {
          '$asset': id,
        },
      })
      // remove cache files
      if (files?.data?.length > 0)
      {
        files.data.forEach(o => removeFile(`data/cache/json/${o.file}.json`))
      }
    }

    // close db
    disconnect()
    // result
    success(req, res, {
      message: '에셋 소유자 데이터를 수정했습니다.',
    })
  }
  catch (e)
  {
    // close db
    disconnect()
    // result
    error(req, res, {
      code: e.code,
      message: '에셋 소유자 데이터를 수정하지 못했습니다.',
      _file: e.code !== 204 ? __filename : undefined,
      _err: e,
    })
  }
}
