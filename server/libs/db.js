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
  share: 'share',
  tokens: 'tokens',
  mapAssetFile: 'map_asset_file',
  mapAssetTag: 'map_asset_tag',
  mapCollectionFile: 'map_collection_file',
  mapCollectionAsset: 'map_collection_asset',
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
 * @param {string} [options.table]
 * @param {string[]} [options.fields]
 * @param {string} [options.where]
 * @param {string|array} [options.join]
 * @param {string} [options.order] id,title,regdate
 * @param {string} [options.sort] desc,asc
 * @param {string} [options.limit]
 * @param {any} [options.values]
 * @param {boolean} [options.run]
 * @return {object}
 */
export function getItems(options = {})
{
  const { table, fields, where, join, order, sort, limit, values, run, prefix, debug } = options
  const field = fields?.length ? fields.join(',') : '*'
  let _prefix = prefix || ''
  let _where = where ? `where ${where}` : ''
  let _order = order ? `order by ${order} ${sort || 'desc'}` : ''
  _order = (!order && sort) ? `order by id ${sort}` : _order
  let _limit = limit || ''
  const sql = optimiseSql(`select ${_prefix} ${field} from ${table} ${parseJoin(join)} ${_where} ${_order} ${_limit}`)
  if (debug) console.warn('getItems():', sql)
  let data
  if (run !== false)
  {
    const query = db.query(sql)
    data = query.all(values)
  }
  return {
    sql,
    values,
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
  const { table, fields, where, join, values, run, prefix, after, debug } = options
  let _field = fields || 'count(*) as count'
  const sql = optimiseSql(`select ${prefix || ''} ${_field} from ${table} ${parseJoin(join)} ${where ? `where ${where}` : ''} ${after || ''}`)
  if (debug) console.warn('getCount():', sql)
  const query = db.query(sql)
  const result = query.get(values)
  let data
  if (run !== false) data = Number(result['count'] || 0)
  return {
    sql,
    values,
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
  const sql = optimiseSql(`select ${field} from ${table} ${parseJoin(join)} ${where ? `where ${where}` : ''}`)
  const query = db.query(sql)
  const data = (run !== false) ? query.get(values) : undefined
  return {
    sql,
    values,
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
    if (item.value || item.valueName)
    {
      fields.push(item.key)
      valueNames.push(item.valueName || '?')
    }
    if (item.value) objects.push(item.value)
  })
  const sql = optimiseSql(`insert into ${table} (${fields.join(', ')}) values (${valueNames.join(', ')})`)
  if (run !== false) db.run(sql, objects)
  return {
    sql,
    values,
    data: getLastIndex(table).data,
  }
}

/**
 * add items
 * @param {string} [options.table]
 * @param {array} [options.fields]
 * @param {array} [options.values]
 * @param {boolean} [options.run]
 * @return {object}
 */
export function addItems(options = {})
{
  const { table, fields, values, run } = options
  const placeholders = values.map(() => `(${fields.map(() => ('?')).join(',')})`).join(', ')
  const sql = optimiseSql(`insert into ${table} (${fields.join(', ')}) values ${placeholders}`)
  if (run !== false) db.run(sql, [].concat(...values))
  return {
    sql,
    values,
    data: true,
  }
}

/**
 * edit item
 * @param {string} [options.table]
 * @param {string[]} [options.set]
 * @param {string} [options.where]
 * @param {any} [options.values]
 * @param {boolean} [options.run]
 * @param {boolean} [options.debug]
 * @return {object}
 */
export function editItem(options = {})
{
  const { table, set, where, values, run, debug } = options
  let sql = optimiseSql(`update ${table} set ${set ? set.filter(Boolean).join(', ') : ''} ${where ? `where ${where}` : ''}`)
  if (debug) console.warn(sql)
  if (run !== false) db.run(sql, removeUndefinedValueKey(values))
  return {
    sql,
    values,
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
  if (run !== false) db.run(sql, values || {})
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

/**
 * join 영역을 필터링한다.
 * @param {string|string[]} src
 * @return {string}
 */
function parseJoin(src)
{
  if (Array.isArray(src))
  {
    return src.map(x => (x)).join(' ')
  }
  else if (typeof src === 'string')
  {
    return src
  }
  return ''
}
