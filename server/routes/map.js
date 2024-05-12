// assets
export { default as assets } from './assets/get-index.js'

// asset
export { default as assetDetail } from './asset/get-detail.js'
export { default as assetCreate } from './asset/post-create.js'
export { default as assetEdit } from './asset/put-edit.js'
export { default as assetRemove } from './asset/delete-remove.js'

// collections
export { default as collections } from './collections/get-index.js'

// collection
export { default as collectionDetail } from './collection/get-detail.js'
export { default as collectionCreate } from './collection/post-create.js'
export { default as collectionEdit } from './collection/put-edit.js'
export { default as collectionRemove } from './collection/delete-remove.js'
export { default as collectionAddAsset } from './collection/post-add-asset.js'
export { default as collectionRemoveAsset } from './collection/delete-remove-asset.js'

// user
export { default as userDetail } from './user/get-detail.js'
export { default as userEdit } from './user/put-edit.js'

// auth
export { default as login } from './auth/post-login.js'
export { default as logout } from './auth/post-logout.js'

// etc
export { default as home } from './etc/get-index.js'
export { default as notFound } from './etc/not-found.js'
