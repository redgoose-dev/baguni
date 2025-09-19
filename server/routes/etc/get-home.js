/**
 * [GET] /
 *
 * Home
 */

import { pref } from '../../classes/Preference.js'
import { onRequest, onResponse, setResponse } from '../../libs/service.js'

export default async (req, _ctx) => {

  let response

  // trigger request event
  await onRequest(req, _ctx)

  // set response
  response = setResponse({
    message: `Welcome to ${pref.appName} API`,
    data: {
      version: pref.version,
      dev: pref.dev,
      build: pref.build,
      installed: pref.installed,
      url: req.url,
    },
  })

  // trigger response event
  await onResponse(req, response, _ctx)

  return response

}
