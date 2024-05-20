import { Database } from 'bun:sqlite'
import { dataPath } from './consts.js'

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
 * TODO: 검증 필요하다.
 * @param {string} [options.table]
 * @param {string[]} [options.fields]
 * @param {string} [options.where]
 * @param {string} [options.order]
 * @param {string} [options.limit]
 * @param {any} [options.values]
 */
export function getItems(options = {})
{
  const { table, fields, where, order, limit, values } = options
  const field = fields?.length ? fields.join(',') : '*'
  const sql = `select ${field} from ${table} ${where ? `where ${where}` : ''} ${order ? `order by ${order}` : ''} ${limit ? `limit ${limit}` : ''}`
  const query = db.query(sql)
  return query.all(values)
}

/**
 * get count item
 * @param {string} [options.table]
 * @param {string} [options.where]
 * @param {string} [options.join]
 * @param {any} [options.values]
 * @return {object}
 */
export function getCount(options)
{
  const { table, where, join, values } = options
  const sql = `select count(*) from ${table} ${join ? `join ${join}` : ''} ${where ? `where ${where}` : ''}`
  const query = db.query(sql)
  const result = query.get(values)
  return {
    sql,
    data: Number(result['count(*)'] || 0),
  }
}

/**
 * get item
 * @param {string} [options.table]
 * @param {string[]} [options.fields]
 * @param {string} [options.where]
 * @param {string} [options.join]
 * @param {any} [options.values]
 * @return {object}
 */
export function getItem(options)
{
  const { table, fields, where, join, values } = options
  const field = fields?.length ? fields.join(',') : '*'
  const sql = `select ${field} from ${table} ${join ? `join ${join}` : ''} ${where ? `where ${where}` : ''}`
  const query = db.query(sql)
  return {
    sql,
    data: query.get(values),
  }
}

/**
 * add item
 * @example
 * options.table
 * options.value = [ { key, valueName, value } ]
 * @param {string} [options.table]
 * @param {array} [options.values]
 * @return {object}
 */
export function addItem(options)
{
  const { table, values } = options
  let fields = []
  let valueNames = []
  let objects = []
  values.forEach(item => {
    fields.push(item.key)
    valueNames.push(item.valueName || '?')
    if (item.value) objects.push(item.value)
  })
  const sql = `insert into ${table} (${fields.join(', ')}) values (${valueNames.join(', ')})`
  db.run(sql, objects)
  return {
    data: getLastIndex(table),
    sql,
  }
}

/**
 * edit item
 * @param {string} [options.table]
 * @param {string} [options.set]
 * @param {string} [options.where]
 * @param {any} [options.values]
 */
export function editItem(options = {})
{
  const { table, set, where, values } = options
  const sql = `update ${table} set ${set} ${where ? `where ${where}` : ''}`
  db.run(sql, values)
}

/**
 * remove item
 * @param {string} [options.table]
 * @param {string} [options.where]
 * @param {any} [options.values]
 */
export function removeItem(options = {})
{
  const { table, where, values } = options
  const sql = `delete from ${table} ${where ? `where ${where}` : ''}`
  db.run(sql, values)
}

/**
 * get last index
 * @param {string} [table]
 * @return {number}
 */
export function getLastIndex(table)
{
  const query = db.query(`select max(id) as maxID from ${table}`)
  return query.get()?.maxID || 0
}

/**
 * 만료된 토큰을 삭제한다.
 */
export function clearTokens()
{
  db.run(`delete from ${tables.tokens} where expired <= CURRENT_TIMESTAMP`, [])
}
