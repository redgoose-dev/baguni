/**
 * [404] Not found
 */

import ServiceError from '../../classes/ServiceError.js'
import { setResponse } from '../../libs/service.js'

export default function notFound(req, _ctx)
{
  return setResponse(new ServiceError('Not Found', {
    status: 404,
  }))
}
