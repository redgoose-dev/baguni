import express from 'express'
import cookieParser from 'cookie-parser'
import { isDev, openServerMessage } from './libs/util.js'
import routes from './routes/main.js'

/**
 * development
 * @param {Express} app
 * @return {Express}
 */
async function development(app)
{
  const { createServer } = await import('vite')
  const vite = await createServer({
    mode: 'development',
    appType: 'custom',
    server: {
      middlewareMode: true,
    },
  })
  app.use(vite.middlewares)
  // extend routes
  routes(app)
  // global route
  app.use('*', async (req, res, _next) => {
    try
    {
      const url = req.originalUrl
      let template = Bun.file(Bun.resolveSync('./index.html', process.cwd()))
      template = await template.text()
      template = await vite.transformIndexHtml(url, template)
      res
        .status(200)
        .set({ 'Content-Type': 'text/html' })
        .end(template)
    }
    catch (e)
    {
      vite.ssrFixStacktrace(e)
      res
        .status(500)
        .end(e.message)
    }
  })
  return app
}

/**
 * production
 * @param {Express} app
 * @return {Express}
 */
function production(app)
{
  const { VITE_OUT_DIR } = import.meta.env
  // extend routes
  routes(app)
  // load static files
  app.use(express.static(VITE_OUT_DIR, {
    index: false,
    extensions: [ 'html' ],
    dotfiles: 'ignore',
    maxAge: '30d',
    redirect: false,
  }))
  // service route
  app.use(async (req, res, _next) => {
    const distDir = `${process.cwd()}/${VITE_OUT_DIR}`
    let template = Bun.file(Bun.resolveSync('./index.html', distDir))
    template = await template.text()
    res
      .status(200)
      .set({ 'Content-Type': 'text/html' })
      .end(template)
  })
  return app
}

/**
 * run server
 * @return {Promise<void>}
 */
async function runServer()
{
  let app = express()
  const dev = isDev()
  const { VITE_TIMEZONE, VITE_HOST, VITE_PORT } = import.meta.env
  // set timezone
  process.env.TZ = VITE_TIMEZONE
  // set cookie
  app.use(cookieParser())
  // render app
  app = dev ? await development(app) : production(app)
  // listen server
  const host = VITE_HOST
  const port = Number(VITE_PORT) || 3000
  app.listen(port, host, () => openServerMessage(host, port, dev))
}

// play
runServer().then()
