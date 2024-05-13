import multer from 'multer'
import { randomBytes } from 'node:crypto'
import { basePath } from './consts.js'

/**
 * 업로드 모듈. 들어오는 파라메터 값으로 저장되는 위치와 파일이름을 판단한다.
 */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // console.log(Object.keys(req))
    cb(null, `${basePath}/`)
  },
  filename: (req, file, cb) => {
    const filename = randomBytes(18).toString('hex')
    cb(null, filename)
  },
})

export default { storage }
