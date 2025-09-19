/**
 * 에셋에서 사용되는 파일의 타입
 * @property {string} [fileTypes.main] 메인파일
 * @property {string} [fileTypes.coverOrigin] 커버 원본 이미지 파일
 * @property {string} [fileTypes.coverCreate] 커버 제작용 이미지 파일
 * @property {string} [fileTypes.body] 설명에서 사용하는 파일
 */
export const fileTypes = {
  main: 'main',
  coverOrigin: 'cover-origin',
  coverCreate: 'cover-create',
  body: 'body',
  cache: 'cache',
}

export const allowFileType = {
  image: [ 'jpg', 'jpeg', 'png', 'gif', 'webp', 'avif' ],
  audio: [ 'mp3', 'wav', 'ogg', 'm4a' ],
  document: [ 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'md' ],
}
export const allowFileTypes = [
  ...allowFileType.image,
  ...allowFileType.document,
]

export const limitUploadSize = 10485760 // 10MB

export const STATIC_CACHE_MAX_AGE = 60 * 60 * 24 * 365 // 1 year
