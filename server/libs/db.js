import { Database } from 'bun:sqlite'

import { basePath } from './consts.js'

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
  db = new Database(`${basePath}/db.sqlite`, {
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

export function getItems()
{
  //
}

/**
 * get count item
 * @param {string} [options.table]
 * @param {string} [options.where]
 * @param {any} [options.values]
 * @return {number}
 */
export function getCount(options)
{
  const { table, where, values } = options
  const query = db.query(`select count(*) from ${table} ${where ? `where ${where}` : ''}`)
  const result = query.get(values)
  return Number(result['count(*)'] || 0)
}

/**
 * get item
 * @param {string} [options.table]
 * @param {string[]} [options.fields]
 * @param {string} [options.where]
 * @param {any} [options.values]
 */
export function getItem(options)
{
  const { table, fields, where, values } = options
  const field = fields?.length ? fields.join(',') : '*'
  const query = db.query(`select ${field} from ${table} ${where ? `where ${where}` : ''}`)
  return query.get(values)
}

/**
 * add item
 * @example
 * options.table
 * options.value = [ { key, valueName, value } ]
 * @param {string} [options.table]
 * @param {array} [options.values]
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

export function removeItem(options)
{
  const { table, where, values } = options
  const sql = `delete from ${table} ${where ? `where ${where}` : ''}`
  db.run(sql, values)
}

export function getLastIndex()
{
  //
}

export function run(sql)
{
  db.exec(sql)
}

/**
 * 만료된 토큰을 삭제한다.
 */
export function clearTokens()
{
  db.run(`delete from ${tables.tokens} where expired <= CURRENT_TIMESTAMP`, [])
}
