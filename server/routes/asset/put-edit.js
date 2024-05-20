/**
 * [PUT] /asset
 * issue: https://github.com/redgoose-dev/baguni/issues/6
 */

import multer from 'multer'
import { uploader, removeJunkFiles } from '../../libs/uploader.js'
import { uploadFields } from '../../libs/consts.js'
import { success, error } from '../output.js'
import { connect, disconnect, tables, addItem, getItem, db } from '../../libs/db.js'
import { checkAuthorization } from '../../libs/token.js'
import { addLog } from '../../libs/log.js'
import { parseJSON } from '../../libs/objects.js'
import { filteringTitle } from '../../libs/strings.js'

export default async (req, res) => {
  const _uploader = uploader()
  const upload = multer(_uploader).fields([
    { name: uploadFields.file, maxCount: 1 },
    { name: uploadFields.coverOriginal, maxCount: 1 },
    { name: uploadFields.coverCreate, maxCount: 1 },
  ])
  upload(req, res, async () => {
    try
    {
      const id = req.params.id
      if (!id) throw new Error(`id 값이 없습니다.`)
      let { title, description, json, tags } = req.body
      let ids = {}
      let readyUpdate = {
        title: undefined,
        description: undefined,
        json: undefined,
        file: undefined,
        tags: undefined,
      }
      let deleteFiles = []
      let deleteData = {}

      // connect db
      connect({ readwrite: true })
      // check auth
      checkAuthorization(req.headers.authorization)

      // get item
      const raw = getItem({
        table: tables.asset,
        where: 'id = $id',
        values: { '$id': id },
      }).data
      if (!raw) throw new Error('No asset data.')
      raw.json = parseJSON(raw.json)

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
      // update file
      const newFile = req.files?.[uploadFields.file]?.[0]
      if (newFile)
      {
        readyUpdate.file = newFile
        const fileData = getItem({
          table: tables.file,
          fields: [ `${tables.file}.*` ],
          join: `${tables.mapAssetFile} on ${tables.file}.id = ${tables.mapAssetFile}.file`,
          where: `asset = $id`,
          values: { '$id': id },
        }).data
        deleteFiles.push(fileData?.path)
      }
      // update json
      if (json)
      {
        json = parseJSON(json) || {}
        // cover image start
        const fileOriginal = req.files?.[uploadFields.coverOriginal]?.[0]
        const fileCreate = req.files?.[uploadFields.coverCreate]?.[0]
        if (json.cover && fileOriginal && fileCreate)
        {
          // json.cover, 커버원본, 커버제작 파일 보두 존재한다면 json 업데이트하고 기존 커버 이미지 삭제한다.
          json.cover.original = fileOriginal
          json.cover.create = {
            ...json.cover.create,
            ...fileCreate,
          }
          deleteFiles.push(raw.json?.cover?.original?.path)
          deleteFiles.push(raw.json?.cover?.create?.path)
        }
        if (!json.cover)
        {
          // json.cover 데이터가 없으므로 새로 올라간 커버 이미지와 기존 커버 이미지 모두 삭제한다.
          deleteFiles.push(fileOriginal?.path)
          deleteFiles.push(fileCreate?.path)
          deleteFiles.push(raw.json?.cover?.original?.path)
          deleteFiles.push(raw.json?.cover?.create?.path)
        }
        // cover image end
        readyUpdate.json = json
      }
      if (tags)
      {
        // TODO: 태그영역 업데이트 준비
        // TODO: GPT에게 물어보니 전부 삭제하고 다시 등록하라고 한다.;;
      }

      // check updated
      if (!Object.values(readyUpdate).some(Boolean))
      {
        throw new Error('수정할 데이터가 없습니다.')
      }

      console.log('UPDATED:', readyUpdate)
      console.log('DELETE FILES:', deleteFiles)
      console.log('DELETE DATA:', deleteData)
      // TODO: asset 테이블 수정
      // TODO: if (readyUpdate.file) file 테이블 수정
      // TODO: if (deleteFiles) 파일삭제

      throw new Error('작업중')

      // close db
      disconnect()
      // result
      success(res, { message: '에셋을 수정했습니다.' })
    }
    catch (e)
    {
      // 이미 업로드한 파일들은 전부 삭제한다.
      removeJunkFiles(req.files)
      // add log
      addLog({ mode: 'error', message: e.message })
      // result
      error(res, {
        message: '에셋을 수정하지 못했습니다.',
        code: e.code,
      })
    }
  })
}
