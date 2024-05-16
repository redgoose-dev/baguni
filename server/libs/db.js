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
 * connect
 * @param {object} options
 */
export function connect(options = {})
{
  db = new Database(`${basePath}/db.sqlite`, {
    ...options,
  })
}

/**
 * disconnect
 */
export function disconnect()
{
  if (!db) return
  db.close()
}

export async function getItems()
{
  //
}

export async function getCount()
{
  //
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
 */
export async function addItem(options)
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

export async function editItem()
{
  //
}

export async function removeItem()
{
  //
}

export async function getLastIndex()
{
  //
}

export async function run(sql)
{
  db.exec(sql)
}
