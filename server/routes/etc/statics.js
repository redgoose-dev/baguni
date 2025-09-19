/**
 * Static
 * for client-side routing
 */

import { onRequest, onResponse, setResponse } from '../../libs/service.js'
import { checkingFile, checkingIgnorePath } from '../../libs/service.js'
import { STATIC_CACHE_MAX_AGE } from '../../libs/assets.js'

const ignorePaths = [
  '/.well-known',
]

export default async (req, _ctx) => {

  let response
  const pathClient = './dist/public'

  // trigger request event
  await onRequest(req, _ctx)

  try
  {
    // set url
    const url = new URL(req.url)
    // check ignore paths
    if (checkingIgnorePath(ignorePaths, url.pathname))
    {
      return new Response('', {
        status: 204,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      })
    }
    // set file path
    const filePath = `${pathClient}${url.pathname}`
    // load file
    const file = Bun.file(filePath)
    if (await file.exists())
    {
      const raw = await file.bytes()
      response = setResponse(raw, 200, {
        headers: {
          'Content-Type': file.type || 'application/octet-stream',
          'Cache-Control': `public, max-age=${STATIC_CACHE_MAX_AGE}`,
        },
      })
    }
    else
    {
      if (checkingFile(url.pathname))
      {
        // 파일이 없고 파일 형식이기 때문에 404로 처리
        response = setResponse('File not found.', 404)
      }
      else
      {
        // Render SPA
        const clientFile = Bun.file(`${pathClient}/index.html`)
        if (await clientFile.exists())
        {
          const html = await clientFile.text()
          response = setResponse(html, 200, {
            headers: {
              'Server': 'bun',
              'Content-Type': 'text/html; charset=utf-8',
            },
          })
        }
        else
        {
          response = setResponse('Page not found.', 404)
        }
      }
    }
  }
  catch (_e)
  {
    setResponse('Page not found.', 404)
  }

  // trigger response event
  await onResponse(req, response, _ctx)

  return response

}
