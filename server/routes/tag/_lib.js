import { tables, getCount, getItems, getItem, addItem, removeItem } from '../../libs/db.js'

/**
 * 태그의 정규식
 * @param {number} length 글자수
 * @return {RegExp}
 */
export function tagRegex(length = 20)
{
  return new RegExp(`^[a-zA-Z0-9-_가-힣ㄱ-ㅎぁ-ゖァ-ヺー一-龯]{1,${length}}$`)
}

/**
 * 태그 데이터 추가하기
 * @param {string} tag
 * @param {number} assetId
 */
export function addTagData(tag, assetId)
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
export function removeTagData(tag, assetId)
{
  if (!(tag && assetId)) return
  tag = tag.trim()
  // 태그 아이디를 가져온다.
  const tagId = getItem({
    table: tables.tag,
    fields: [ 'id' ],
    where: 'name LIKE $name',
    values: { '$name': tag },
  }).data?.id
  if (!tagId) return
  try
  {
    // 태그맵에서 데이터를 삭제한다.
    removeItem({
      table: tables.mapAssetTag,
      where: `asset = ${assetId} AND tag = ${tagId}`,
    })
  }
  catch (e)
  {}
  // 태그맵에서 갯수를 가져온다.
  const cnt = getCount({
    table: tables.mapAssetTag,
    where: 'tag = $tag',
    values: { '$tag': tagId },
  }).data
  // 태그맵에서 데티어가 없으면 태그를 삭제한다.
  if (!cnt)
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
 * 에셋 아이디로 태그 모두 제거하기
 * @param {number} assetId
 */
export function removeTagsByAsset(assetId)
{
  const _maps = getItems({
    table: tables.mapAssetTag,
    where: `asset = ${assetId}`,
  }).data
  removeItem({
    table: tables.mapAssetTag,
    where: `asset = ${assetId}`,
  })
  _maps.forEach(item => {
    const count = getCount({
      table: tables.mapAssetTag,
      where: `tag = ${item.tag}`,
    }).data
    if (count === 0)
    {
      removeItem({
        table: tables.tag,
        where: `id = ${item.tag}`,
      })
    }
  })
}
