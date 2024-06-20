const { VITE_LOCAL_PATH_NAME } = import.meta.env

export const SHARE_PERMISSION = {
  PUBLIC: 'PUBLIC',
  PRIVATE: 'PRIVATE',
}

export const defaultUserPreference = {
  asset: {
    index_size: 24,
    index_paginateRange: 10,
    create_fileLimitSize: 1000,
  },
  collection: {
    index_size: 8,
  },
  account: {},
}

// TODO: 삭제예정
export const defaultAssetsIndexFilter = {
  dateStart: undefined,
  dateEnd: undefined,
  fileType: 'all',
  order: 'id',
  sort: 'desc',
  q: undefined,
  indexTheme: 'thumbnail', // list,thumbnail
}
