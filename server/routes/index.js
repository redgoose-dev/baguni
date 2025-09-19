import statics from './etc/statics.js'

export default {
  // home
  '/api/': async (req, ctx) => (await import('./etc/get-home.js')).default(req, ctx),

  // assets
  '/api/asset/': {
    // 에셋 목록
    GET: async (req, ctx) => (await import('./asset/get-index.js')).default(req, ctx),
    // 에셋 만들기
    PUT: async (req, ctx) => (await import('./asset/put-item.js')).default(req, ctx),
  },
  '/api/asset/:id/': {
    // 상세 데이터
    GET: async (req, ctx) => (await import('./asset/get-item.js')).default(req, ctx),
    // 에셋 수정
    PATCH: async (req, ctx) => (await import('./asset/patch-item.js')).default(req, ctx),
    // 에셋 삭제
    DELETE: async (req, ctx) => (await import('./asset/delete-item.js')).default(req, ctx),
  },
  '/api/asset/:id/file-body/': {
    // 에셋 바디용 파일 목록
    GET: async (req, ctx) => (await import('./asset/file-body/get-index.js')).default(req, ctx),
    // 에셋 바디용 파일을 추가한다.
    PUT: async (req, ctx) => (await import('./asset/file-body/put-item.js')).default(req, ctx),
  },
  '/api/asset/:id/file-body/:file/': {
    // 에셋 바디용 파일 삭제
    DELETE: async (req, ctx) => (await import('./asset/file-body/delete-item.js')).default(req, ctx),
  },
  '/api/asset/:id/collection/': {
    // 에셋이 속한 컬렉션 편집
    PATCH: async (req, ctx) => (await import('./asset/patch-collection.js')).default(req, ctx),
  },
  '/api/asset/:id/share/': {
    // 에셋 공유 코드 가져오거나 만들기
    PUT: async (req, ctx) => (await import('./share/put-item.js')).default(req, ctx),
  },

  // collection
  '/api/collection/': {
    // 컬렉션 목록
    GET: async (req, ctx) => (await import('./collection/get-index.js')).default(req, ctx),
    // 컬렉션 만들기
    PUT: async (req, ctx) => (await import('./collection/put-item.js')).default(req, ctx),
  },
  '/api/collection/:id/': {
    // 컬렉션 상세
    GET: async (req, ctx) => (await import('./collection/get-item.js')).default(req, ctx),
    // 컬렉션 수정
    PATCH: async (req, ctx) => (await import('./collection/patch-item.js')).default(req, ctx),
    // 컬렉션 삭제
    DELETE: async (req, ctx) => (await import('./collection/delete-item.js')).default(req, ctx),
  },
  '/api/collection/:id/asset/': {
    // 컬렉션 - 에셋 목록
    GET: async (req, ctx) => (await import('./collection/get-asset.js')).default(req, ctx),
  },
  '/api/collection/:id/asset/:asset/': {
    // 컬렉션 - 에셋 추가
    PUT: async (req, ctx) => (await import('./collection/put-asset.js')).default(req, ctx),
    // 컬렉션 - 에셋 제거
    DELETE: async (req, ctx) => (await import('./collection/delete-asset.js')).default(req, ctx),
  },

  // auth
  '/api/login/': {
    // 계정 로그인
    POST: async (req, ctx) => (await import('./auth/post-login.js')).default(req, ctx),
  },
  '/api/logout/': {
    // 계정 로그아웃
    POST: async (req, ctx) => (await import('./auth/post-logout.js')).default(req, ctx),
  },
  '/api/check/': {
    // 인증검사
    POST: async (req, ctx) => (await import('./auth/post-check.js')).default(req, ctx),
  },

  // provider
  '/api/provider/': {
    // 프로바이더 목록
    GET: async (req, ctx) => (await import('./auth/get-providers.js')).default(req, ctx),
    // 프로바이더 만들기
    PUT: async (req, ctx) => (await import('./auth/put-provider.js')).default(req, ctx),
  },
  '/api/provider/:id/': {
    // 프로바이더 정보 가져오기
    GET: async (req, ctx) => (await import('./auth/get-provider.js')).default(req, ctx),
    // 프로바이더 수정
    PATCH: async (req, ctx) => (await import('./auth/patch-provider.js')).default(req, ctx),
    // 프로바이더 삭제
    DELETE: async (req, ctx) => (await import('./auth/delete-provider.js')).default(req, ctx),
  },

  // file
  '/file/:id/': {
    // 파일 열기
    GET: async (req, ctx) => (await import('./file/get-item.js')).default(req, ctx),
  },
  '/file/:id/download/': {
    // 파일 다운로드
    GET: async (req, ctx) => (await import('./file/get-download.js')).default(req, ctx),
  },

  // tag
  '/api/tag/': {
    // 태그 목록 가져오기
    GET: async (req, ctx) => (await import('./tag/get-index.js')).default(req, ctx),
  },

  // preference
  '/api/preference/': {
    // 환경설정 가져오기
    GET: async (req, ctx) => (await import('./preference/get-item.js')).default(req, ctx),
    // 환경설정 업데이트
    PATCH: async (req, ctx) => (await import('./preference/patch-item.js')).default(req, ctx),
  },

  // share
  '/api/share/:code/': {
    // 에셋 공유
    GET: async (req, ctx) => (await import('./share/get-item.js')).default(req, ctx),
  },

  // etc
  '/*': statics, // Serving static
}
