import { tables, getItem, addItem, removeItem, getCount, editItem } from './db.js'

/**
 * 태그 데이터 추가하기
 */
export function addTag(tag, assetId)
{
  tag = tag.trim()
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
 * 파일 추가하기
 */
export function addFile(file, assetId, type)
{
  const { path, originalname, mimetype, size, ...restFile } = file
  const fileId = addItem({
    table: tables.file,
    values: [
      { key: 'path', value: path },
      { key: 'name', value: originalname },
      { key: 'type', value: mimetype },
      { key: 'size', value: size },
      { key: 'meta', value: JSON.stringify(restFile) },
      { key: 'regdate', valueName: 'CURRENT_TIMESTAMP' },
      { key: 'updated_at', valueName: 'CURRENT_TIMESTAMP' },
    ].filter(Boolean),
  }).data
  addItem({
    table: tables.mapAssetFile,
    values: [
      { key: 'asset', value: assetId },
      { key: 'file', value: fileId },
      { key: 'type', value: type },
    ],
  })
}

/**
 * 파일 수정하기
 */
export function editFile(file, assetId)
{
  if (!file) return
  const { path, originalname, mimetype, size, ...restFile } = file
  const fileData = getItem({
    table: tables.file,
    fields: [ `${tables.file}.*` ],
    join: `${tables.mapAssetFile} on ${tables.file}.id = ${tables.mapAssetFile}.file`,
    where: `${tables.mapAssetFile}.asset = $asset and ${tables.mapAssetFile}.type = $type`,
    values: {
      '$asset': assetId,
      '$type': 'asset',
    },
  })
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
      '$id': fileData.data.id,
      '$path': path,
      '$name': originalname,
      '$type': mimetype,
      '$size': size,
      '$meta': JSON.stringify(restFile),
    },
  })
}
