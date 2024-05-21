import { Database } from 'bun:sqlite'
import { dataPath } from './consts.js'
import { removeUndefinedValueKey } from './objects.js'

/** @var {Database} db */
export let db

export const tables = {
  asset: 'asset',
  collection: 'collection',
  file: 'file',
  tag: 'tag',
  user: 'user',
  tokens: 'tokens',
  mapAssetCollection: 'map_asset_collection',
  mapAssetFile: 'map_asset_file',
  mapAssetTag: 'map_asset_tag',
  permissionUser: 'permission_user',
}

/**
 * connect db
 * @param {object} options
 * @param {?boolean} [options.readonly]
 * @param {?boolean} [options.create]
 * @param {?boolean} [options.readwrite]
 */
export function connect(options = {})
{
  db = new Database(`${dataPath}/db.sqlite`, {
    ...options,
  })
}

/**
 * disconnect db
 */
export function disconnect()
{
  if (!db) return
  db.close()
}

/**
 * get items
 * TODO: 검증이 좀더 필요하며 기능이 좀더 붙어야 한다.
 * @param {string} [options.table]
 * @param {string[]} [options.fields]
 * @param {string} [options.where]
 * @param {string} [options.join]
 * @param {string} [options.order]
 * @param {string} [options.limit]
 * @param {any} [options.values]
 * @param {boolean} [options.run]
 * @return {object}
 */
export function getItems(options = {})
{
  const { table, fields, where, join, order, limit, values, run } = options
  const field = fields?.length ? fields.join(',') : '*'
  const sql = optimiseSql(`select ${field} from ${table} ${join ? `join ${join}` : ''} ${where ? `where ${where}` : ''} ${order ? `order by ${order}` : ''} ${limit ? `limit ${limit}` : ''}`)
  let data
  if (run !== false)
  {
    const query = db.query(sql)
    data = query.all(values)
  }
  return {
    sql,
    data,
  }
}

/**
 * get count item
 * @param {string} [options.table]
 * @param {string} [options.where]
 * @param {string} [options.join]
 * @param {any} [options.values]
 * @param {boolean} [options.run]
 * @return {object}
 */
export function getCount(options)
{
  const { table, where, join, values, run } = options
  const sql = optimiseSql(`select count(*) from ${table} ${join ? `join ${join}` : ''} ${where ? `where ${where}` : ''}`)
  const query = db.query(sql)
  const result = query.get(values)
  const data = (run !== false) ? Number(result['count(*)'] || 0) : undefined
  return {
    sql,
    data,
  }
}

/**
 * get item
 * @param {string} [options.table]
 * @param {string[]} [options.fields]
 * @param {string} [options.where]
 * @param {string} [options.join]
 * @param {any} [options.values]
 * @param {boolean} [options.run]
 * @return {object}
 */
export function getItem(options)
{
  const { table, fields, where, join, values, run } = options
  const field = fields?.length ? fields.join(',') : '*'
  const sql = optimiseSql(`select ${field} from ${table} ${join ? `join ${join}` : ''} ${where ? `where ${where}` : ''}`)
  const query = db.query(sql)
  const data = (run !== false) ? query.get(values) : undefined
  return {
    sql,
    data,
  }
}

/**
 * add item
 * @example
 * options.table
 * options.value = [ { key, valueName, value } ]
 * @param {string} [options.table]
 * @param {array} [options.values]
 * @param {boolean} [options.run]
 * @return {object}
 */
export function addItem(options)
{
  const { table, values, run } = options
  let fields = []
  let valueNames = []
  let objects = []
  values.forEach(item => {
    fields.push(item.key)
    valueNames.push(item.valueName || '?')
    if (item.value) objects.push(item.value)
  })
  const sql = optimiseSql(`insert into ${table} (${fields.join(', ')}) values (${valueNames.join(', ')})`)
  if (run !== false) db.run(sql, objects)
  return {
    data: getLastIndex(table).data,
    sql,
  }
}

/**
 * edit item
 * @param {string} [options.table]
 * @param {string[]} [options.set]
 * @param {string} [options.where]
 * @param {any} [options.values]
 * @param {boolean} [options.run]
 * @return {object}
 */
export function editItem(options = {})
{
  const { table, set, where, values, run } = options
  let sql = optimiseSql(`update ${table} set ${set ? set.filter(Boolean).join(', ') : ''} ${where ? `where ${where}` : ''}`)
  if (run !== false) db.run(sql, removeUndefinedValueKey(values))
  return {
    sql,
  }
}

/**
 * remove item
 * @param {string} [options.table]
 * @param {string} [options.where]
 * @param {any} [options.values]
 * @param {boolean} [options.run]
 * @return {object}
 */
export function removeItem(options = {})
{
  const { table, where, values, run } = options
  const sql = optimiseSql(`delete from ${table} ${where ? `where ${where}` : ''}`)
  if (run !== false) db.run(sql, values)
  return {
    sql,
    values,
  }
}

/**
 * get last index
 * @param {string} [table]
 * @return {object}
 */
export function getLastIndex(table)
{
  const sql = `select max(id) as maxID from ${table}`
  const query = db.query(sql)
  return {
    sql,
    data: query.get()?.maxID || 0,
  }
}

/**
 * 만료된 토큰을 삭제한다.
 * @return {object}
 */
export function clearTokens()
{
  const sql = `delete from ${tables.tokens} where expired <= CURRENT_TIMESTAMP`
  db.run(sql, [])
  return {
    sql,
  }
}

/**
 * sql 최적화
 * @param {string} str
 * @return {string}
 */
function optimiseSql(str)
{
  return str.trim().replace(/\s{2,}/g, ' ')
}
