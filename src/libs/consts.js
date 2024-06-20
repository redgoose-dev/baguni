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

export const fileTypes = {
  image: '이미지',
  document: '문서',
  audio: '음악',
  video: '동영상',
  application: '어플리케이션',
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
