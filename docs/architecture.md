# 구조와 데이터 흐름

## 서비스와 기술

개인 이미지·파일 보관 서비스입니다. 에셋에 원본, 표지, 본문 파일, 태그를 붙이고 컬렉션으로 묶습니다. 로그인한 사용자가 관리하고 공개 에셋과 공유 코드로 외부에 노출할 수 있습니다. 별도의 사용자별 소유권 컬럼은 주요 에셋 테이블에 없으므로 계정별 독립 공간이라고 가정하지 않습니다.

| 위치 | 역할 |
| --- | --- |
| `client/main.js` | Vue 앱 진입점과 루트 |
| `client/router/` | 화면 경로, 인증 가드, 개발용 가이드 |
| `client/store/index.js` | Pinia 인증·설정·에셋 필터 상태 |
| `client/libs/api.js` | ofetch API 인스턴스, Authorization, FormData |
| `client/pages/` | asset, collection, account, token, preference, share 등 화면 |
| `client/components/`, `client/modules/` | UI, 편집기, 토스트, Markdown |
| `server/main.js` | 환경설정 로드, DB 초기화, Bun.serve, 신호 기반 종료 |
| `server/routes/index.js` | HTTP 메서드별 경로와 동적 import |
| `server/libs/service.js` | 설치 확인, 공용 연결 확보, 응답과 요청 로그 |
| `server/libs/db.js` | bun:sqlite 공용 연결, SQL 헬퍼와 테이블 이름 |
| `server/classes/Preference.js` | data/preference.json 로드·갱신, 설치 상태 |
| `server/libs/token.js`, `cookie.js` | JWT, 저장된 토큰 검사, 쿠키 |
| `server/routes/file/_lib.js` | 파일 업로드·삭제·메타데이터·캐시 보조 함수 |
| `resource/install.js`, `seed.sql` | 관리자 생성, 디렉토리·DB·설정 초기화 |
| `server/build.js`, `vite.config.js` | Bun 서버 번들 및 Vite 클라이언트 빌드 |

JavaScript ESM 프로젝트이며 Node 대신 Bun 런타임이 필요합니다. 백엔드는 Elysia가 아닌 **Bun.serve의 routes**를 직접 사용합니다. `jsconfig.json`의 `@/*`는 `server/*`를 가리킵니다. TypeScript 검사 명령은 구성되어 있지 않으며 `checkJs: false`입니다.

## 요청과 연결 수명

설정이 있으면 서버 시작 시 읽기·쓰기 SQLite 연결을 하나 엽니다. 설치 전에는 DB를 만들지 않고 서버만 실행하며, 요청은 503을 반환합니다. 설치 완료 후 첫 요청에서 설정을 로드하고 연결을 확보할 수 있습니다.

라우트는 `onRequest` → 입력 파싱·인증 → SQL·파일 작업 → `setResponse` → `onResponse` 순으로 처리합니다. `onRequest`의 `connect()`는 이미 연결되어 있으면 바로 반환합니다. DB 헬퍼도 연결이 없을 때 동일한 연결 함수를 사용합니다. 핸들러는 연결을 닫지 않습니다.

SIGINT/SIGTERM에서는 `shutdown()`이 `server.stop(false)`로 처리 중인 요청을 기다린 후 DB를 닫습니다. 중복 종료 호출은 같은 Promise를 반환합니다. listen 실패와 PRAGMA 초기화 실패도 연결을 정리합니다. 직접 `pref.server.stop()`만 호출하면 DB는 닫히지 않으므로 애플리케이션 종료에는 `shutdown()`을 사용합니다.

기존 WAL, synchronous=NORMAL, temp_store=MEMORY 설정을 유지합니다. mmap/cache 크기는 연결 생성 시 DB 크기의 3배를 기준으로 계산합니다. 종전 1시간 캐시 대신 재시작·재연결 시 다시 계산합니다. SQLite 호출 자체는 동기적이지만 핸들러의 파일 I/O 등 `await` 구간에는 다른 요청이 실행될 수 있습니다. 한 요청이 공유 연결을 닫으면 다른 요청에 영향을 주므로 요청별 disconnect를 다시 추가하지 않습니다.

## 데이터

| 테이블 | 용도·관계 |
| --- | --- |
| `asset` | 제목, 설명, type, JSON, public/private 모드, 생성·수정 시간 |
| `file` | 저장 경로, 이름, MIME, 크기, 메타데이터, module/module_id, main/cover/body 모드 |
| `collection` | 컬렉션 제목·설명 |
| `tag` | 고유 태그 이름 |
| `map_collection_asset` | 컬렉션과 에셋 다대다 연결 |
| `map_asset_tag` | 에셋과 태그 다대다 연결 |
| `share` | 에셋별 고유 공유 코드 |
| `provider` | 계정 ID, 이메일, 이름, 암호 해시 등 |
| `tokens` | JWT access/refresh, 표시 이름, 만료·생성 시간 |

정의와 신규 설치용 인덱스의 기준은 `resource/seed.sql`입니다. seed 수정만으로 기존 DB가 마이그레이션되지는 않습니다. `DATA_PATH` 아래에 `db.sqlite`, `preference.json`, `origin/`, `cover/`, `cache/`, `logs/`, `tmp/`를 둡니다. DB에는 파일 경로가 저장되므로 데이터를 옮길 때 경로도 확인합니다.

## 인증과 파일

클라이언트 라우터는 login/share를 제외한 화면에서 `auth.checkin()`을 실행합니다. API 클라이언트는 `/api`로 요청하며 인증 토큰을 Authorization 헤더에 전달합니다. 로그인은 bcryptjs로 암호를 검사하고 JWT 두 개를 발급해 DB와 쿠키에 저장합니다. 클라이언트 공개 토큰은 JWT 서명 끝부분이며 서버는 `access LIKE '%토큰'`으로 조회한 뒤 JWT를 검증합니다. `_a` 쿼리도 토큰 전달에 사용됩니다.

파일 API는 원본과 JSON 캐시를 확인하며 Sharp로 리사이즈하고 WebP 캐시를 만듭니다. 공개 캐시 적중 시 DB 조회를 생략할 수 있습니다. 비공개 캐시는 저장된 토큰과 요청 토큰을 비교하는 별도 경로가 있으므로 인증 로직 수정 시 함께 검토해야 합니다. 다운로드는 file/asset 정보와 공개 여부를 조회합니다. 파일 변경과 DB 변경은 자동으로 하나의 트랜잭션이 되지 않습니다.

## API 지도

실제 파라미터·응답은 각 핸들러의 구현이 기준이며, 대부분 관리 API는 인증이 필요합니다.

| 경로 | 메서드·기능 |
| --- | --- |
| `/api/` | 서비스 정보 |
| `/api/asset/`, `/api/asset/:id/` | GET 목록·상세, PUT 생성, PATCH 수정, DELETE 삭제 |
| `/api/asset/:id/file-body/`, `.../:file/` | GET 목록, PUT 본문 파일 추가, DELETE 제거 |
| `/api/asset/:id/collection/` | PATCH 소속 컬렉션 |
| `/api/asset/:id/share/` | PUT 공유 코드 조회·생성 |
| `/api/collection/`, `/api/collection/:id/` | GET, PUT, PATCH, DELETE |
| `/api/collection/:id/asset/`, `.../:asset/` | GET 목록, PUT 연결, DELETE 연결 해제 |
| `/api/login/`, `/api/logout/`, `/api/check/` | POST 로그인·로그아웃·인증 확인 |
| `/api/provider/`, `/api/provider/:id/` | GET, PUT, PATCH, DELETE 계정 관리 |
| `/api/token/`, `/api/token/:id/` | GET 목록, PUT 생성, DELETE 삭제 |
| `/api/tag/` | GET 태그 |
| `/api/preference/` | GET 설정, PATCH 설정 변경 |
| `/api/share/:code/` | GET 공유 에셋 |
| `/file/:id/`, `/file/:id/download/` | GET 표시·다운로드 |
| `/*` | dist/public 정적 파일 및 SPA fallback |
