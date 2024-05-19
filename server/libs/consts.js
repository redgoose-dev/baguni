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
