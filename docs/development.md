# 개발·운영

## 설치와 실행

검증 런타임은 Bun 1.4.3입니다. lockfile을 우선하여 설치합니다.

```sh
bun install --frozen-lockfile
# 새 데이터 디렉토리에 최초 설치할 때만 실행 (관리자 정보 입력)
bun run app:install
bun run dev
```

`app:install`은 DB·관리자·JWT secret을 만들고 기존 데이터가 있으면 삭제 여부를 물을 수 있습니다. 이미 설치된 환경에서 무심코 다시 실행하지 않습니다. `app:uninstall`은 데이터 삭제 도구입니다.

| 명령 | 역할 |
| --- | --- |
| `bun run dev` | NODE_ENV=development로 Bun 서버와 Vite 동시 실행 |
| `bun run dev:server` | 서버만 실행; 개발 모드가 필요하면 NODE_ENV를 직접 지정 |
| `bun run build` | dist 삭제 → 서버 번들 → 클라이언트 번들 |
| `bun run preview` | dist/main.js로 실제 서버 실행 |
| `bun test tests/` 또는 `bun run test` | 운영 데이터 없이 회귀 테스트 |

개발 프론트는 VITE_PORT에서 열고 `/api`, `/file`은 Bun 서버로 프록시합니다. 운영은 Bun 서버가 `dist/public`을 직접 제공합니다. 백엔드 번들은 bcryptjs, image-size, jsonwebtoken, minimist, sharp를 외부 의존성으로 남깁니다. 서버 빌드는 `Bun.build().success`를 검사하여 실패를 종료 코드에 반영합니다.

## 환경과 설정

기본값은 루트 `.env`, 로컬 덮어쓰기는 `.env.local`입니다. 실제 secret이나 운영 설정 내용은 문서·테스트에 복사하지 않습니다.

| 변수 | 용도 / 저장소 기본값 |
| --- | --- |
| `HOST` | 바인딩 주소 / 0.0.0.0 |
| `PORT` | Bun HTTP 포트 / 80 |
| `VITE_PORT` | 개발 프론트 포트 / 81 |
| `DATA_PATH` | DB·설정·업로드 루트 / ./data |
| `URL_PATH` | 서비스 공개 URL / http://localhost |
| `COOKIE_PREFIX`, `COOKIE_DOMAIN`, `COOKIE_PATH` | 쿠키 이름·범위 / baguni, localhost, / |
| `COOKIE_HTTPONLY` | HttpOnly 문자열 설정 / true |
| `NODE_ENV` | development이면 개발 로그·동작 사용 |
| `TZ` | 시간대 / Asia/Seoul |
| `USE_BUILD` | 서버 빌드 시 주입 |

`.env`의 `BASE_PATH`는 현재 서버·클라이언트 소스에서 사용처가 확인되지 않았습니다. 개발에서는 3000/5173 같은 비특권 포트를 `.env.local`에 지정할 수 있습니다. `preference.json`에는 페이지 크기, 업로드 제한, 썸네일 크기, 캐시 수명과 `_token` 비밀키가 들어갑니다. `_token`은 공개 출력에서 제외됩니다.

## 배포와 백업

Dockerfile은 oven/bun 이미지에서 빌드하고 production dependencies, dist, resource, .env, package.json, jsconfig.json만 런타임 이미지에 복사합니다. `tests/`, `docs/`는 빌드 컨텍스트에서 제외합니다. 컨테이너의 `/app/data`, `/app/.env.local`을 지속 저장하고 실제 서비스 도메인과 쿠키 도메인을 맞춥니다. Docker 기본 태그가 alpine으로 고정 버전은 아니므로 이미지 갱신 시 Bun/네이티브 Sharp 호환성을 확인합니다.

연결을 유지하므로 실행 중 DB 파일을 교체·삭제하지 않습니다. 서버를 SIGTERM으로 정상 종료하고 DB·preference·업로드를 함께 백업·복원합니다. WAL 사용 중 실행 상태의 db.sqlite만 복사하면 최신 쓰기를 빠뜨릴 수 있으므로 온라인 백업은 SQLite 백업 방법을 별도 사용합니다. 강제 종료와 장시간 업로드가 겹치지 않도록 배포 종료 유예 시간을 설정합니다.

## 2026-10-22 의존성 업데이트

`bun update --latest`로 package.json과 bun.lock을 함께 갱신했습니다.

| 패키지 | 이전 → 적용 |
| --- | --- |
| @types/bun | 1.3.14 → 1.4.3 |
| image-size | 2.0.2 → 2.0.4 |
| sharp | 0.34.5 → 0.35.5 |
| @redgoose/json-editor | 1.2.3 → 1.2.7 |
| @vitejs/plugin-vue | 6.0.6 → 6.0.10 |
| concurrently | 9.2.1 → 10.0.6 |
| marked | 18.0.3 → 18.1.1 |
| pinia | 3.0.4 → 4.1.0 |
| sass | 1.99.0 → 1.106.1 |
| terser | 5.47.1 → 5.51.2 |
| vite | 8.0.12 → 8.3.5 |
| vue | 3.5.34 → 3.5.44 |
| vue-router | 5.0.7 → 5.4.0 |

전이 의존성도 lockfile에 반영했습니다. Pinia의 실제 프로젝트 스토어 동작, Sharp 리사이즈, API 테스트와 전체 빌드를 검증합니다. 참고 프로젝트의 TypeScript 7 문제는 이 JavaScript 프로젝트에는 적용되지 않습니다. Bun이 차단한 `@parcel/watcher`의 소스 빌드 postinstall은 추가로 허용하지 않았으며 현재 플랫폼의 빌드는 통과했습니다.

## 2026-10-23 개발 서버 포트 오류 수정

`bun run dev`에서 `No available ports found between NaN and 65535`가 발생했습니다. Vite 설정 평가 시 `Bun.env.VITE_PORT`가 없으면 `Number(undefined)`가 NaN이 되고 API 프록시 PORT도 undefined가 됩니다. Bun 자동 환경 파일 로딩을 끈 실행으로 재현했습니다.

`vite.config.js`에서 Vite의 `loadEnv(mode, 프로젝트 루트, '')`로 환경 파일을 명시적으로 읽습니다. 실행 프로세스의 환경변수가 파일보다 우선하며, 이 객체를 클라이언트 define에 전달하지 않습니다. `Number(env.VITE_PORT || 5173)`와 `Number(env.PORT || 80)`으로 숫자로 변환하며, 미설정·빈 값에는 각각 5173과 80을 사용합니다. 별도의 포트 검증 함수는 두지 않습니다.

[Vite 환경변수 설정 문서](https://vite.dev/config/#using-environment-variables-in-config)에 따른 수정입니다. 임시 DATA_PATH와 별도 로컬 포트로 실제 `bun run dev`를 실행해 프론트 HTTP 200과 API 프록시의 미설치 HTTP 503 응답을 확인했고 서버를 종료했습니다. production 빌드도 통과했습니다.
