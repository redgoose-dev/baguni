import { Database } from 'bun:sqlite'
import { removeUndefinedValueKey } from './objects.js'

const { DATA_PATH } = Bun.env

/** @var {Database} db */
export let db

/**
 * db table 목록
 */
export const tables = {
  asset: 'asset',
  collection: 'collection',
  file: 'file',
  tag: 'tag',
  provider: 'provider',
  share: 'share',
  tokens: 'tokens',
  mapCollectionAsset: 'map_collection_asset',
  mapAssetTag: 'map_asset_tag',
}

/**
 * 서버 수명 동안 하나의 읽기·쓰기 연결을 재사용한다.
 * 설치 전에는 호출하지 않는다. 없는 DB를 생성하지 않는다.
 */
export function connect()
{
  if (db) return
  const connection = new Database(`${DATA_PATH}/db.sqlite`, {
    readwrite: true,
    create: false,
  })
  try
  {
    connection.run('PRAGMA journal_mode = WAL')
    connection.run('PRAGMA synchronous = NORMAL')
    const { mmap, cache } = getPragmaValues()
    connection.run(`PRAGMA mmap_size = ${mmap}`)
    connection.run(`PRAGMA cache_size = ${cache}`)
    connection.run('PRAGMA temp_store = MEMORY')
    db = connection
  }
  catch (error)
  {
    connection.close()
    throw error
  }
}

/**
 * disconnect db
 */
export function disconnect()
{
  if (!db) return
  db.close()
  db = undefined
}

/**
 * get items
 * @param {string} [options.table]
 * @param {string[]} [options.fields]
 * @param {string} [options.where]
 * @param {string|array} [options.join]
 * @param {string} [options.order] id,title,created_at
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
  let _where = where ? `WHERE ${where}` : ''
  let _order = order ? `ORDER BY ${order} ${sort || 'desc'}` : ''
  _order = (!order && sort) ? `ORDER BY id ${sort}` : _order
  let _limit = limit || ''
  const sql = optimiseSql(`SELECT ${_prefix} ${field} FROM ${table} ${parseJoin(join)} ${_where} ${_order} ${_limit}`)
  if (debug) console.warn('getItems():', sql)
  let data
  if (run !== false)
  {
    if (!db) connect()
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
 * @param {object} options
 * @return {object}
 */
export function getCount(options)
{
  const { table, fields, where, join, values, run, prefix, after, debug } = options
  let _field = fields || 'COUNT(*) AS count'
  const sql = optimiseSql(`SELECT ${prefix || ''} ${_field} FROM ${table} ${parseJoin(join)} ${where ? `WHERE ${where}` : ''} ${after || ''}`)
  if (debug) console.warn('getCount():', sql)
  if (!db) connect()
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
 * @param {string|array} [options.join]
 * @param {any} [options.values]
 * @param {boolean?} [options.run]
 * @return {object}
 */
export function getItem(options)
{
  const { table, fields, where, join, values, run } = options
  const field = fields?.length ? fields.join(',') : '*'
  const sql = optimiseSql(`SELECT ${field} FROM ${table} ${parseJoin(join)} ${where ? `WHERE ${where}` : ''}`)
  if (!db) connect()
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
  const sql = optimiseSql(`INSERT INTO ${table} (${fields.join(', ')}) VALUES (${valueNames.join(', ')})`)
  if (run !== false)
  {
    if (!db) connect()
    db.run(sql, objects)
  }
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
  const sql = optimiseSql(`INSERT INTO ${table} (${fields.join(', ')}) VALUES ${placeholders}`)
  if (run !== false)
  {
    if (!db) connect()
    db.run(sql, [].concat(...values))
  }
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
  let sql = optimiseSql(`UPDATE ${table} SET ${set ? set.filter(Boolean).join(', ') : ''} ${where ? `WHERE ${where}` : ''}`)
  if (debug) console.warn(sql)
  if (run !== false)
  {
    if (!db) connect()
    db.run(sql, removeUndefinedValueKey(values))
  }
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
  const sql = optimiseSql(`DELETE FROM ${table} ${where ? `WHERE ${where}` : ''}`)
  if (run !== false)
  {
    if (!db) connect()
    db.run(sql, values || {})
  }
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
  const sql = `SELECT MAX(id) AS max_id FROM ${table}`
  if (!db) connect()
  const query = db.query(sql)
  return {
    sql,
    data: query.get()?.max_id || 0,
  }
}

/**
 * 만료된 토큰을 삭제한다.
 * @return {object}
 */
export function clearTokens()
{
  const sql = `DELETE FROM ${tables.tokens} WHERE expired <= CURRENT_TIMESTAMP`
  if (!db) connect()
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

/**
 * 연결 생성 시 DB 크기에 맞춰 설정한다. 서버 재시작 때 다시 계산한다.
 */
function getPragmaValues()
{
  const dbSize = Bun.file(`${DATA_PATH}/db.sqlite`).size
  return {
    mmap: Math.ceil(dbSize * 3),
    cache: -Math.ceil((dbSize * 3) / 1024), // 음수 = KB 단위
  }
}
