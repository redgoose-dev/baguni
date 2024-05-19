/**
 * [POST] /asset
 * issue: https://github.com/redgoose-dev/baguni/issues/5
 */

import multer from 'multer'
import { uploader, removeJunkFiles, convertCoverData } from '../../libs/uploader.js'
import { uploadFields } from '../../libs/consts.js'
import { success, error } from '../output.js'
import { checkExistValue } from '../../libs/objects.js'
import { connect, disconnect } from '../../libs/db.js'
import { checkAuthorization } from '../../libs/token.js'
import { addLog } from '../../libs/log.js'
import { parseJSON } from '../../libs/objects.js'

export default async (req, res) => {
  const _uploader = uploader()
  const upload = multer(_uploader).fields([
    { name: uploadFields.file, maxCount: 1 },
    { name: uploadFields.coverOriginal, maxCount: 1 },
    { name: uploadFields.coverCreate, maxCount: 1 },
  ])
  upload(req, res, async (err) => {
    try
    {
      let { title, description, json, tags } = req.body
      console.log('*'.repeat(30))
      console.log('BODY//', req.body)
      console.log('FILE//', req.files[uploadFields.file])
      console.log('COVER_ORIGINAL//', req.files[uploadFields.coverOriginal])
      console.log('COVER_CREATE//', req.files[uploadFields.coverCreate])
      console.log('*'.repeat(30))
      // check value
      // if (!req.files[uploadFields.file]) throw new Error('파일이 없습니다.') // TODO: 다 만들어지면 주석풀기
      // connect db
      connect({ readwrite: true })
      // check auth
      const user = checkAuthorization(req.headers.authorization)
      // filtering values
      title = title.trim()
      // check and set json
      json = parseJSON(json)
      console.log('=== WORKING ===')
      // set cover data
      json = convertCoverData(json, req.files)
      console.log(json)
      // throw new Error('작업중')
      // TODO: 커버 이미지 부분 처리하기 (첨부와 json 데이터 둘다 존재하면 마저 구성하고 json쪽 값이 없으면 첨부파일 지우기)
      // TODO: asset 테이블에 데이터 입력하기
      // TODO: file 테이블에 데이터 입력하기
      // TODO: map_asset_file 테이블에 데이터 입력하기
      // TODO: 태그값이 있으면 값 처리하기
      // TODO: tag 테이블에 값 확인하고, 없으면 값 추가하기 (tag 수량만큼 반복 돌리기)
      // TODO: map_asset_tag 테이블에 값 추가하기 (tag 수량만큼 반복 돌리기)
      disconnect()
      // result
      success(res, {
        message: '에셋을 만들었습니다.',
        data: {},
      })
    }
    catch (e)
    {
      // 이미 업로드한 파일들은 전부 삭제한다.
      removeJunkFiles(req.files)
      // add log
      addLog({ mode: 'error', message: e.message })
      // result
      error(res, {
        message: '에셋을 추가하지 못했습니다.',
        code: e.code,
      })
    }
  })
}
