const { VITE_LOCAL_PATH_NAME } = import.meta.env

export const SHARE_PERMISSION = {
  PUBLIC: 'PUBLIC',
  PRIVATE: 'PRIVATE',
}

export const defaultUserPreference = {
  asset: {
    index_size: 8,
    create_fileLimitSize: 1000,
  },
  collection: {
    index_size: 8,
  },
  account: {},
}
