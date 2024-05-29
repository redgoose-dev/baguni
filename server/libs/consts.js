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
 * @property {string} [fileTypes.main] 메인파일
 * @property {string} [fileTypes.coverOriginal] 커버 원본 이미지 파일
 * @property {string} [fileTypes.coverCreate] 커버 제작용 이미지 파일
 * @property {string} [fileTypes.body] 설명에서 사용하는 파일
 */
export const fileTypes = {
  main: 'main',
  coverOriginal: 'cover-original',
  coverCreate: 'cover-create',
  body: 'body',
}

export const defaultPageSize = 24
