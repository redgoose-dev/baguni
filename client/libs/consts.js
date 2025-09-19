export const ASSET_MODE = {
  PUBLIC: 'public',
  PRIVATE: 'private',
}

export const assetContentBody = {
  host: '{{API_HOST}}',
  hostLine: new RegExp('(\{\{API_HOST\}\}/file/[^/]+/)', 'g'),
}
