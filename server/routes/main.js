import { Router } from 'express'
import { cookieSetup } from '../libs/cookie.js'
import { home, notFound } from './etc.js'

/** @var {Express} app */
let app

/**
 * routes
 */
function appRoutes()
{
  const router = Router()
  router.all('/', home)
  router.get('/fooo/', async (req, res) => {
    res.json({
      foo: 'bar',
    })
  })
  router.all('*', notFound)
  return router
}

/**
 * setup
 */
function setup(req, res, _next)
{
  // set cookie
  cookieSetup({ secure: req.secure })
  _next()
}

/**
 * @param {Express} _app
 */
export default function(_app)
{
  app = _app
  const { VITE_BASE_PATH, VITE_LOCAL_PATH_NAME } = import.meta.env
  app.use(setup)
  app.use(`${VITE_BASE_PATH}/${VITE_LOCAL_PATH_NAME}/`.replace(/\/\//gi, '/'), appRoutes())
}
