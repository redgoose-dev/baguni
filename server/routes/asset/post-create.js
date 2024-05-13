/**
 * [POST] /asset
 */
import multer from 'multer'
import uploader from '../../libs/uploader.js'

export default async (req, res) => {
  const upload = multer(uploader).single('upload')
  upload(req, res, (err) => {
    console.log('=== DESTINATION ===')
    console.log(req.body)
    console.log(req.file)
    res.json({
      message: 'create asset',
    })
  })
}
