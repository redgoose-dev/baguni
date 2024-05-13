import { Database } from 'bun:sqlite'

import { basePath } from './consts.js'

/** @var {Database} db */
export let db

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

export async function getItem()
{
  //
}

export async function addItem()
{
  //
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

export async function run()
{
  //
}

