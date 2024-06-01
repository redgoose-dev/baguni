// assets
export { default as assets } from './assets/get-index.js'

// asset
export { default as assetDetail } from './asset/get-detail.js'
export { default as assetCreate } from './asset/post-create.js'
export { default as assetEdit } from './asset/put-edit.js'
export { default as assetRemove } from './asset/delete-remove.js'
export { default as assetUpdateCollections } from './asset/put-update-collection.js'

// collections
export { default as collections } from './collections/get-index.js'

// collection
export { default as collectionDetail } from './collection/get-detail.js'
export { default as collectionCreate } from './collection/post-create.js'
export { default as collectionEdit } from './collection/put-edit.js'
export { default as collectionRemove } from './collection/delete-remove.js'
export { default as collectionAssets } from './collection/get-assets.js'
export { default as collectionAssetAdd } from './collection/post-asset-add.js'
export { default as collectionAssetRemove } from './collection/delete-asset-remove.js'

// user
export { default as userDetail } from './user/get-detail.js'
export { default as userEdit } from './user/put-edit.js'

// auth
export { default as login } from './auth/post-login.js'
export { default as logout } from './auth/post-logout.js'
export { default as check } from './auth/post-check.js'

// etc
export { default as home } from './etc/get-index.js'
export { default as file } from './etc/get-file.js'
export { default as download } from './etc/get-download.js'
export { default as notFound } from './etc/not-found.js'
