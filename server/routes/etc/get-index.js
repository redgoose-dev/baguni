/**
 * [GET] /
 *
 * Home
 */

import pkg from '../../../package.json'
import { success, error } from '../output.js'

const { VITE_HOST, VITE_PORT } = import.meta.env

export default async (req, res) => {
  try
  {
    const url = `${req.protocol}://${VITE_HOST}:${VITE_PORT}${req.originalUrl}`
    success(req, res, {
      message: 'Welcome to 바구니(BA.GU.NI) API',
      data: {
        version: pkg.version,
        url,
      },
    })
  }
  catch (e)
  {
    error(req, res, {
      code: e.code,
      message: '어떤 오류가 발생했어요.',
      _file: __filename,
      _err: e,
    })
  }
}
