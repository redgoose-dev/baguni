/**
 * [PUT] /collection
 *
 * Edit collection
 */

import multer from 'multer'
import { existsSync, rmSync } from 'node:fs'
import { uploader } from '../../libs/uploader.js'
import { uploadFields, fileTypes } from '../../libs/consts.js'
import { success, error } from '../output.js'
import { connect, disconnect, tables, getItem, getItems, editItem, addItem, removeItem } from '../../libs/db.js'
import { checkAuthorization } from '../../libs/token.js'
import { checkExistValueInObject, findObjectByValue } from '../../libs/objects.js'
import { filteringTitle } from '../../libs/strings.js'
import { addFileData, editFileData, removeJunkFiles, removeFile } from '../../libs/service.js'
import { checkAssetOwner } from '../../libs/service.js'
import { ownerModes } from '../../../global/consts.js'
import ServiceError from '../../libs/ServiceError.js'

export default async (req, res) => {
  const _uploader = uploader()
  const upload = multer(_uploader).fields([
    { name: uploadFields.coverOriginal, maxCount: 1 },
    { name: uploadFields.coverCreate, maxCount: 1 },
  ])
  upload(req, res, async () => {
    try
    {
      const id = req.params.id
      if (!id) throw new ServiceError('컬렉션 ID 값이 없습니다.')

      let { title, description, remove_files } = req.body
      let readyUpdate = {
        title: undefined,
        description: undefined,
      }

      // connect db
      connect({ readwrite: true })
      // check auth
      const auth = checkAuthorization(req.headers.authorization)

      // check owner
      checkAssetOwner(ownerModes.COLLECTION, auth.id, id)

      // get item
      const collection = getItem({
        table: tables.collection,
        where: 'id = $id',
        values: { '$id': id },
      })
      if (!collection.data) throw new ServiceError('컬렉션 데이터가 없습니다.')
      const srcMapFiles = getItems({
        table: tables.file,
        fields: [
          `${tables.mapCollectionFile}.*`,
          `${tables.file}.path`,
        ],
        join: `join ${tables.mapCollectionFile} on ${tables.file}.id = ${tables.mapCollectionFile}.file`,
        where: `${tables.mapCollectionFile}.collection = $collection`,
        values: { '$collection': id },
      }).data

      // update title
      if (title)
      {
        readyUpdate.title = filteringTitle(title)
      }

      // update description
      if (description)
      {
        readyUpdate.description = description
      }

      // ready update files
      let removeFiles
      if (remove_files) removeFiles = remove_files.split(',')
      // update cover original file
      if (removeFiles?.includes(fileTypes.coverOriginal))
      {
        removeFileData({
          map: srcMapFiles,
          fileType: fileTypes.coverOriginal,
        })
      }
      else
      {
        const fileCoverOriginal = req.files?.[uploadFields.coverOriginal]?.[0]
        updateFile({
          file: fileCoverOriginal,
          map: srcMapFiles,
          fileType: fileTypes.coverOriginal,
          collectionId: id,
        })
      }
      // update cover create file
      if (removeFiles?.includes(fileTypes.coverCreate))
      {
        removeFileData({
          map: srcMapFiles,
          fileType: fileTypes.coverCreate,
        })
      }
      else
      {
        const fileCreate = req.files?.[uploadFields.coverCreate]?.[0]
        updateFile({
          file: fileCreate,
          map: srcMapFiles,
          fileType: fileTypes.coverCreate,
          collectionId: id,
        })
      }

      // update data
      updateData(readyUpdate, id)

      // close db
      disconnect()
      // result
      success(req, res, {
        message: '컬렉션을 수정했습니다.',
      })
    }
    catch (e)
    {
      // 이미 업로드한 파일들은 전부 삭제한다.
      removeJunkFiles(req.files)
      // close db
      disconnect()
      // result
      error(req, res, {
        code: e.code,
        message: '컬렉션을 수정하지 못했습니다.',
        _file: __filename,
        _err: e,
      })
    }
  })
}

function updateFile(options)
{
  const { file, map, fileType, collectionId } = options
  if (!file) return
  const data = findObjectByValue(map, 'type', fileType)
  if (data?.path)
  {
    editFileData(file, data.file)
    if (existsSync(data.path)) rmSync(data.path)
  }
  else
  {
    const fileMainId = addFileData(file)
    addItem({
      table: tables.mapCollectionFile,
      values: [
        { key: 'collection', value: collectionId },
        { key: 'file', value: fileMainId },
        { key: 'type', value: fileType },
      ],
    })
  }
}
function removeFileData(options)
{
  const { map, fileType } = options
  const data = findObjectByValue(map, 'type', fileType)
  if (!data) return
  removeItem({
    table: tables.file,
    where: 'id = $id',
    values: { '$id': data.file },
  })
  removeItem({
    table: tables.mapCollectionFile,
    where: 'id = $id',
    values: { '$id': data.id },
  })
  removeFile(data.path)
}

function updateData(data, collectionId)
{
  if (!data) return
  if (!checkExistValueInObject(data, ['title', 'description'])) return
  editItem({
    table: tables.collection,
    where: 'id = $id',
    set: [
      data.title && 'title = $title',
      data.description && 'description = $description',
      'updated_at = CURRENT_TIMESTAMP',
    ],
    values: {
      '$id': collectionId,
      '$title': data.title,
      '$description': data.description,
    },
  })
}
