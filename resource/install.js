import { mkdir, exists } from 'node:fs/promises'
// import { createInterface } from 'node:readline/promises'
import { Database } from 'bun:sqlite'
import { message } from './libs.js'

const { VITE_DIR_DB, VITE_DIR_UPLOAD } = import.meta.env
const basePath = 'user'
const paths = {
  db: `${basePath}/${VITE_DIR_DB}`,
  seedDB: `resource/seed.sql`,
}
const createPathList = [
  `${basePath}/${VITE_DIR_UPLOAD}/original`,
  `${basePath}/${VITE_DIR_UPLOAD}/thumbnail`,
  paths.db,
]

/**
 * check directories
 * @return {Promise<boolean>}
 */
async function checkDirectories()
{
  const res = await Promise.all(createPathList.map(path => {
    return exists(path)
  }))
  return !res.includes(false)
}

/**
 * create directories
 * @return {Promise<void>}
 */
async function createDirectories()
{
  if (!(await checkDirectories()))
  {
    await Promise.all(createPathList.map(path => {
      return mkdir(path, { recursive: true })
    }))
  }
  message('', 'Create directory')
}

/**
 * create database
 * @return {Promise<void>}
 */
async function createDatabase()
{
  using db = new Database(`${paths.db}/main.sqlite`, {
    create: true,
  })
  try
  {
    let seed = Bun.file(paths.seedDB)
    seed = await seed.text()
    db.exec(seed)
  }
  catch (e)
  {
    message('error', e.message)
  }
  db.close(true)
  message('', 'Create database')
}

function complete()
{
  message('', 'Complete install')
}

// actions
// TODO:
await createDirectories()
await createDatabase()
// TODO: add user
complete()
