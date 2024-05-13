import { Router } from 'express'
import multer from 'multer'
import { cookieSetup } from '../libs/cookie.js'
import * as map from './map.js'

/** @var {Express} app */
let app

/**
 * routes
 */
function appRoutes()
{
  const router = Router()
  router.all('/', map.home)
  // asset
  router.get('/assets/', map.assets)
  router.get('/asset/', map.assetDetail)
  router.post('/asset/', map.assetCreate)
  router.put('/asset/', map.assetEdit)
  router.delete('/asset/', map.assetRemove)
  // collection
  router.get('/collections/', map.collections)
  router.get('/collection/', map.collectionDetail)
  router.post('/collection/', map.collectionCreate)
  router.put('/collection/', map.collectionEdit)
  router.delete('/collection/', map.collectionRemove)
  router.post('/collection/asset/', map.collectionAddAsset)
  router.delete('/collection/asset/', map.collectionRemoveAsset)
  // user
  router.get('/user/', map.userDetail)
  router.put('/user/', map.userEdit)
  // auth
  router.post('/login/', map.login)
  router.post('/logout/', map.logout)
  // etc
  router.all('*', map.notFound)
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
