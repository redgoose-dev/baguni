import { Router } from 'express'
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
  router.get('/asset/:id/', map.assetDetail)
  router.post('/asset/', map.assetCreate)
  router.put('/asset/:id/', map.assetEdit)
  router.delete('/asset/:id/', map.assetRemove)
  // collection
  router.get('/collections/', map.collections)
  router.get('/collection/:id/', map.collectionDetail)
  router.post('/collection/', map.collectionCreate)
  router.put('/collection/:id/', map.collectionEdit)
  router.delete('/collection/:id/', map.collectionRemove)
  router.post('/collection/asset/:id/', map.collectionAddAsset)
  router.delete('/collection/asset/:id/', map.collectionRemoveAsset)
  // user
  router.get('/user/:id/', map.userDetail)
  router.put('/user/:id/', map.userEdit)
  // auth
  router.post('/login/', map.login)
  router.post('/logout/', map.logout)
  router.post('/check/', map.check)
  // etc
  router.get('/file/:id/', map.file)
  router.all('*', map.notFound)
  return router
}

/**
 * setup
 */
function setup(req, res, _next)
{
  // set cookie
  _next()
}

/**
 * @param {Express} _app
 */
export default function(_app)
{
  app = _app
  const { VITE_URL_PATH, VITE_LOCAL_PATH_NAME } = import.meta.env
  app.use(setup)
  app.use(`${VITE_URL_PATH}/${VITE_LOCAL_PATH_NAME}/`.replace(/\/\//gi, '/'), appRoutes())
}
