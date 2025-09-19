import { randomBytes } from 'node:crypto'
import sizeOf from 'image-size'
import ServiceError from '../../classes/ServiceError.js'
import { pref } from '../../classes/Preference.js'
import { tables, getItems, getItem, addItem, removeItem } from '../../libs/db.js'
import { fileTypes, allowFileType, allowFileTypes, limitUploadSize } from '../../libs/assets.js'
import { dateFormat, getByte } from '../../libs/strings.js'

const { DATA_PATH } = Bun.env

/**
 * 업로드용 패스 만들기
 * @param {string} mode
 * @return {string}
 */
export function getUploadPath(mode)
{
  let path = `${DATA_PATH}/`
  switch (mode)
  {
    case fileTypes.main:
    case fileTypes.body:
      path += 'origin/'
      break
    case fileTypes.coverOrigin:
    case fileTypes.coverCreate:
      path += 'cover/'
      break
    case fileTypes.cache:
      path += 'cache/'
      break
    default:
      path += 'tmp/'
      break
  }
  if (mode)
  {
    path += dateFormat(new Date(), '{yyyy}-{MM}') + '/'
    path = path.replace(/\/\//gi, '/')
  }
  return path
}

/**
 * 업로드용 파일명 만들기
 *
 * @param {string} mode
 * @return {string}
 */
export function getFilename(mode)
{
  let name = randomBytes(18).toString('hex')
  switch (mode)
  {
    case fileTypes.coverOrigin:
      name = `o-${name}`
      break
    case fileTypes.coverCreate:
      name = `c-${name}`
      break
  }
  return name
}

/**
 * exist file
 * @param {string} path
 * @return {Promise<boolean>}
 */
export async function existFile(path)
{
  const file = Bun.file(path)
  return await file.exists()
}

/**
 * remove file
 * @param {string} path
 * @return {Promise<void>}
 */
export async function removeFile(path)
{
  if (!path) return
  const file = Bun.file(path)
  if (!(await file.exists())) return
  await file.delete()
}

/**
 * file upload
 * @param {string} mode fileTypes
 * @param {File} file
 * @param {object} options
 * @return {Promise<object>}
 */
export async function fileUpload(mode, file, options = {})
{
  const { limitSize, allowType } = options
  if (!file) return null
  // checking file
  if (!(file instanceof File))
  {
    throw new ServiceError(`첨부파일이 'File' 타입이 아닙니다.`, { status: 400 })
  }
  // check mime
  const fileType = file.type.split('/')[1]
  if (!(allowType || allowFileTypes).includes(fileType))
  {
    throw new ServiceError(`'${fileType}' 파일은 업로드할 수 없습니다.`, { status: 400 })
  }
  // check limit size
  const limitFileSize = limitSize || limitUploadSize
  if (!(limitFileSize >= file.size))
  {
    throw new ServiceError(`업로드 가능한 파일 크기는 ${getByte(limitFileSize)} 입니다.`, { status: 400 })
  }
  // set destination path
  const path = getUploadPath(mode)
  // set file name
  const filename = getFilename(mode)
  // upload file
  await Bun.write(`${path}${filename}`, file)
  // return
  return {
    path: `${path}${filename}`,
    name: file.name,
    size: file.size,
    mime: file.type,
  }
}

/**
 * 파일 데이터 추가하기
 * @param {object} op
 * @param {object} op.file
 * @param {'asset'|'collection'} op.module
 * @param {number} op.module_id
 * @param {string} op.mode (main|body|cover-create|cover-origin)
 * @return {number}
 */
export function addFileData(op = {})
{
  const { file, module, module_id, mode } = op
  return addItem({
    table: tables.file,
    values: [
      { key: 'path', value: file.path },
      { key: 'name', value: file.name },
      { key: 'type', value: file.mime },
      { key: 'size', value: file.size },
      {
        key: 'meta',
        value: JSON.stringify({
          ...getImageSize(file.path, file.mime),
        }),
      },
      { key: 'module', value: module },
      { key: 'module_id', value: module_id },
      { key: 'mode', value: mode },
      { key: 'created_at', valueName: 'CURRENT_TIMESTAMP' },
    ].filter(Boolean),
  }).data
}

/**
 * update file data
 * @param {object} op
 * @param {number} op.id
 * @param {string} op.module
 * @param {number} op.module_id
 * @param {string} op.mode
 * @param {File} op.file
 */
export async function changeFileData(op = {})
{
  const { id, module, module_id, mode, file } = op
  if (!file) return
  const uploadedFile = await fileUpload(mode, file, {
    allowType: mode === fileTypes.main ? allowFileTypes : allowFileType.image,
    limitSize: pref.getFileLimitSize(mode),
  })
  if (!uploadedFile) return
  // 파일 데이터가 있기 때문에 이전 파일은 삭제한다.
  if (id) removeFileData(id)
  addFileData({
    file: uploadedFile,
    module,
    module_id,
    mode,
  })
}

/**
 * remove file data
 * 데이터와 파일을 삭제한다.
 * @param {number} id
 * @param {array} exec
 */
export function removeFileData(id, exec = [ 'data', 'file' ])
{
  const data = getItem({
    table: tables.file,
    fields: [ 'path' ],
    where: 'id = $id',
    values: { '$id': id },
  }).data
  if (!data) return
  if (exec.includes('data'))
  {
    removeItem({
      table: tables.file,
      where: 'id = $id',
      values: { '$id': id },
    })
  }
  if (exec.includes('file'))
  {
    removeFile(data.path).then()
    removeFile(getCachePath(id)).then()
  }
}

/**
 * 모듈과 모듈 아이디로 파일 데이터 삭제하기
 * @param {string} module
 * @param {number} module_id
 * @param {array} exec
 */
export function removeFilesData(module, module_id, exec = [ 'data', 'file' ])
{
  if (!(module && module_id)) return
  const _where = `module LIKE '${module}' AND module_id = ${module_id}`
  const files = getItems({
    table: tables.file,
    fields: [ 'id', 'path' ],
    where: _where,
  }).data
  if (exec.includes('file'))
  {
    files.forEach(file => {
      removeFile(file.path).then()
      removeFile(getCachePath(file.id)).then()
    })
  }
  if (exec.includes('data'))
  {
    removeItem({
      table: tables.file,
      where: _where,
    })
  }
}

/**
 * remove junk files
 * @param {object} files
 */
export async function removeJunkFiles(files)
{
  if (!files) return
  for (const file of Object.values(files))
  {
    if (file?.path) await removeFile(file.path)
  }
}

/**
 * 이미지 사이즈를 가져온다.
 * @param {string} path
 * @param {string} type
 * @return {object|undefined}
 */
export function getImageSize(path, type)
{
  if (!(path && type && /^image/.test(type))) return undefined
  const { width, height } = sizeOf(path)
  return { width, height }
}

/**
 * check file
 * @param {File} file
 * @return {boolean}
 */
export function checkFile(file)
{
  if (!file) return false
  return file instanceof File
}

/**
 * get cache path
 * @param {number} id
 * @return {string}
 */
export function getCachePath(id)
{
  return `${DATA_PATH}/cache/json/${id}.json`
}
