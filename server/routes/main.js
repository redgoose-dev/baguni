import { Router } from 'express'
import * as map from './map.js'
import RunningTimer from '../libs/RunningTimer.js'

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
  router.put('/asset/:id/collections/', map.assetUpdateCollections)
  router.get('/asset/:id/share/', map.assetGetShareCode)
  router.put('/asset/:id/owner/', map.assetUpdateOwner)
  // asset - file body
  router.get('/asset/:id/file-body/', map.assetFileBodyIndex)
  router.post('/asset/:id/file-body/', map.assetFileBodyAddItem)
  router.delete('/asset/:id/file-body/:file/', map.assetFileBodyDeleteItem)
  // collection
  router.get('/collections/', map.collections)
  router.get('/collection/:id/', map.collectionDetail)
  router.post('/collection/', map.collectionCreate)
  router.put('/collection/:id/', map.collectionEdit)
  router.delete('/collection/:id/', map.collectionRemove)
  router.post('/collection/:id/asset/', map.collectionAssetAdd)
  router.delete('/collection/:id/asset/:asset/', map.collectionAssetRemove)
  router.get('/collection/:id/assets/', map.collectionAssets)
  router.get('/collection/image/:file/', map.collectionImage)
  // user
  router.get('/user/:id/', map.userDetail)
  router.post('/user/', map.userCreate)
  router.put('/user/:id/', map.userEdit)
  // share
  router.get('/share/:code/', map.shareDetail)
  // file
  router.get('/file/:id/', map.fileDefault)
  router.get('/download/:id/', map.fileDownload)
  // auth
  router.post('/login/', map.login)
  router.post('/logout/', map.logout)
  router.post('/check/', map.check)
  // etc
  router.get('/tags/', map.tags)
  router.all('*', map.notFound)
  return router
}

/**
 * setup
 */
function setup(req, res, _next)
{
  // start running timer
  res.runTime = new RunningTimer()
  // next
  _next()
}

/**
 * @param {Express} _app
 */
export default function(_app)
{
  app = _app
  const { VITE_LOCAL_PATH, VITE_LOCAL_PATH_NAME } = import.meta.env
  app.use(setup)
  app.use(`${VITE_LOCAL_PATH}/${VITE_LOCAL_PATH_NAME}/`.replace(/\/\//gi, '/'), appRoutes())
}

/**
 * 로컬 패스인지 검사한다.
 */
function checkLocalPath(path)
{
  const { VITE_LOCAL_PATH, VITE_LOCAL_PATH_NAME } = import.meta.env
  const regExp = new RegExp(`^${VITE_LOCAL_PATH}/${VITE_LOCAL_PATH_NAME}/`.replace(/\/\//gi, '/'))
  return regExp.test(path)
}
