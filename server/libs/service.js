import { existsSync, rmSync } from 'node:fs'
import sizeOf from 'image-size'
import iconv from 'iconv-lite'
import { tagRegex } from '../../global/strings.js'
import { tables, getItem, addItem, removeItem, getCount, editItem } from './db.js'
import { ownerModes } from '../../global/consts.js'
import ServiceError from '../libs/ServiceError.js'

/**
 * 태그 데이터 추가하기
 */
export function addTag(tag, assetId)
{
  tag = tag.trim()
  if (!tagRegex().test(tag)) return
  let tagId = getItem({
    table: tables.tag,
    fields: [ 'id' ],
    where: 'name like $name',
    values: { '$name': tag },
  }).data?.id
  if (!tagId)
  {
    try
    {
      tagId = addItem({
        table: tables.tag,
        values: [{ key: 'name', value: tag }],
      }).data
    }
    catch (e)
    {}
  }
  if (tagId)
  {
    addItem({
      table: tables.mapAssetTag,
      values: [
        { key: 'asset', value: assetId },
        { key: 'tag', value: tagId },
      ],
    })
  }
}

/**
 * 태그 데이터 제거하기
 */
export function removeTag(tag, assetId)
{
  if (!(tag && assetId)) return
  tag = tag.trim()
  // 태그 아이디를 가져온다.
  const tagId = getItem({
    table: tables.tag,
    fields: [ 'id' ],
    where: 'name like $name',
    values: { '$name': tag },
  }).data?.id
  if (!tagId) return
  try
  {
    // 태그맵에서 데이터를 삭제한다.
    removeItem({
      table: tables.mapAssetTag,
      where: 'asset = $asset and tag = $tagId',
      values: {
        '$asset': assetId,
        '$tagId': tagId,
      },
    })
  }
  catch (e)
  {}
  // 태그맵에서 갯수를 가져온다.
  const cnt = getCount({
    table: tables.mapAssetTag,
    where: 'tag = $tag',
    values: { '$tag': tagId },
  })
  // 태그맵에서 데티어가 없으면 태그를 삭제한다.
  if (!cnt.data)
  {
    try
    {
      removeItem({
        table: tables.tag,
        where: 'id = $id',
        values: { '$id': tagId },
      })
    }
    catch (e)
    {}
  }
}

/**
 * 파일 데이터 추가하기
 */
export function addFileData(file)
{
  const { path, originalname, mimetype, size, ...restFile } = file
  const originalName = iconv.decode(Buffer.from(originalname, 'binary'), 'utf-8')
  const res = addItem({
    table: tables.file,
    values: [
      { key: 'path', value: path },
      { key: 'name', value: originalName },
      { key: 'type', value: mimetype },
      { key: 'size', value: size },
      {
        key: 'meta',
        value: JSON.stringify({
          ...getImageSize(path, mimetype),
        }),
      },
      { key: 'regdate', valueName: 'CURRENT_TIMESTAMP' },
      { key: 'updated_at', valueName: 'CURRENT_TIMESTAMP' },
    ].filter(Boolean),
  })
  return res.data
}

/**
 * 파일 데이터 수정하기
 */
export function editFileData(file, id)
{
  const { path, originalname, mimetype, size, ...restFile } = file
  const originalName = iconv.decode(Buffer.from(originalname, 'binary'), 'utf-8')
  editItem({
    table: tables.file,
    where: 'id = $id',
    set: [
      `path = $path`,
      `name = $name`,
      `type = $type`,
      `size = $size`,
      `meta = $meta`,
      `updated_at = CURRENT_TIMESTAMP`,
    ],
    values: {
      '$id': id,
      '$path': path,
      '$name': originalName,
      '$type': mimetype,
      '$size': size,
      '$meta': JSON.stringify({
        ...getImageSize(path, mimetype),
      }),
    },
  })
}

/**
 * 안쓰는 파일들 삭제한다.
 */
export function removeJunkFiles(files)
{
  if (!files) return
  Object.values(files).forEach((file) => {
    if (!existsSync(file[0].path)) return
    rmSync(file[0].path)
  })
}

export function removeFile(file)
{
  if (!file) return
  if (!existsSync(file)) return
  rmSync(file)
}

/**
 * 이미지 사이즈를 가져온다.
 * @param {string} path
 * @param {strong} type
 * @return {object|undefined}
 */
export function getImageSize(path, type)
{
  if (!(path && type && /^image/.test(type))) return undefined
  const { width, height } = sizeOf(path)
  return { width, height }
}

/**
 * 에셋 소유자인지 검사한다.
 * @param {string} mode
 * @param {number} user
 * @param {number} id
 */
export function checkAssetOwner(mode, user, id)
{
  let where
  let values = {
    '$user': user,
  }
  switch (mode)
  {
    case ownerModes.ASSET:
      where = 'asset = $asset and user = $user'
      values['$asset'] = id
      break
    case ownerModes.COLLECTION:
      where = 'collection = $collection and user = $user'
      values['$collection'] = id
      break
  }
  const owner = getCount({
    table: tables.owner,
    where,
    values,
  })
  if (!(owner?.data > 0)) throw new ServiceError('데이터의 소유자가 아닙니다.', 403)
}
