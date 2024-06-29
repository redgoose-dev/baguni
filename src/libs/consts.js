
export const SHARE_PERMISSION = {
  PUBLIC: 'PUBLIC',
  PRIVATE: 'PRIVATE',
}

export const defaultUserPreference = {
  asset: {
    index_size: 24,
    index_pageRange: 10,
    file_mainLimitSize: 10485760,
    file_coverCreateSize: { width: 640, height: 480 },
    file_bodyLimitCount: 30,
    file_types: {
      image: '이미지',
    },
  },
  collection: {
    index_size: 8,
    file_coverCreateSize: { width: 640, height: 480 },
  },
}
