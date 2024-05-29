/**
 * [GET] /
 */

import pkg from '../../../package.json'

const { VITE_HOST, VITE_PORT, VITE_LOCAL_PATH_NAME } = import.meta.env

export default async (req, res) => {

  const url = `http://${VITE_HOST}:${VITE_PORT}/${VITE_LOCAL_PATH_NAME}/`

  res.json({
    message: 'Welcome to BA.GU.NI(바구니) API',
    version: pkg.version,
    url,
  })
}
