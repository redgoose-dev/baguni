const {
  VITE_BASE_PATH,
  VITE_DATA_PATH,
  COOKIE_PREFIX,
  COOKIE_HTTPONLY,
  COOKIE_PATH,
  COOKIE_DOMAIN
} = import.meta.env

export const basePath = VITE_BASE_PATH || './'
export const dataPath = basePath + (VITE_DATA_PATH || 'data')

export const cookie = {
  prefix: COOKIE_PREFIX,
  options: {
    httpOnly: (COOKIE_HTTPONLY === 'true'),
    path: COOKIE_PATH || '/',
    domain: COOKIE_DOMAIN || undefined,
  },
}

export const uploadFields = {
  file: 'file',
  coverOriginal: 'cover_original',
  coverCreate: 'cover_create',
  cache: 'cache',
}

/**
 * 에셋에서 사용되는 파일의 타입
 * @property {string} [fileTypeForAsset.asset] 에셋
 * @property {string} [fileTypeForAsset.assetCoverOriginal] 에셋 커버 원본
 * @property {string} [fileTypeForAsset.assetCoverCreate] 에셋 커버 제작용
 * @property {string} [fileTypeForAsset.assetBody] 에셋 설명 본문
 * @property {string} [fileTypeForAsset.collectionCover] 콜렉션 커버
 */
export const fileTypeForAsset = {
  asset: 'asset',
  assetCoverOriginal: 'asset-cover-original',
  assetCoverCreate: 'asset-cover-create',
  assetBody: 'asset-body',
  collectionCoverOriginal: 'collection-cover-original',
  collectionCoverCreate: 'collection-cover-create',
}
