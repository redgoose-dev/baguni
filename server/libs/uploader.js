import multer from 'multer'
import { randomBytes } from 'node:crypto'
import { mkdirSync, existsSync } from 'node:fs'
import { dataPath, uploadFields } from './consts.js'
import { getUploadPathName } from './util.js'

/**
 * 업로드 모듈. 들어오는 파라메터 값으로 저장되는 위치와 파일이름을 판단한다.
 */

export function uploader(options = {})
{
  const {} = options
  return {
    storage: multer.diskStorage({
      /**
       * 파일을 저장하는 위치를 제어한다.
       */
      destination: (req, file, cb) => {
        let path = dataPath
        switch (file.fieldname)
        {
          case uploadFields.file:
            path += getUploadPathName('original')
            break
          case uploadFields.coverOriginal:
          case uploadFields.coverCreate:
            path += getUploadPathName('cover')
            break
          case uploadFields.cache:
            path += getUploadPathName('cache')
            break
          default:
            path += '/tmp'
        }
        if (!existsSync(path)) mkdirSync(path, { recursive: true })
        cb(null, path)
      },
      /**
       * 파일이름을 조정한다.
       */
      filename: (req, file, cb) => {
        let name = randomBytes(18).toString('hex')
        switch (file.fieldname)
        {
          case uploadFields.coverOriginal:
            name = `o-${name}`
            break
          case uploadFields.coverCreate:
            name = `c-${name}`
            break
        }
        cb(null, name)
      },
    }),
    /**
     * 파일 업로드를 허용할지 안할지에 대하여 판단하는 영역
     * TODO: 나중에 허용하지 않은 타입이라면 거부할 수 있게 조정해야한다.
     */
    fileFilter: (req, file, cb) => {
      let allow = true
      switch (file.fieldname)
      {
        case uploadFields.file:
          break
        case uploadFields.coverOriginal:
        case uploadFields.coverCreate:
          break
        case uploadFields.cache:
          break
        default:
          allow = false
          break
      }
      cb(null, allow)
    },
  }
}
