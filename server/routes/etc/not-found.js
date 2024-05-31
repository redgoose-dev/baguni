/**
 * [404] Not found
 */

import { writeLog } from '../output.js'

export default async (req, res) => {
  const code = 404
  const message = 'Not found.'
  writeLog(req, res, 'error', {
    status: code,
    message,
  })
  res.status(code).json({ message })
}
