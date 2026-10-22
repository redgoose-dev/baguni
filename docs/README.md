# BAGUNI 유지보수 인수인계

이 문서는 `keep.redgoose.me` 체크아웃을 다른 채팅 세션과 에이전트가 이어서 수정하기 위한 출발점입니다. 분석·검증 기준일은 2026-10-22이며 제품 이름은 **바구니(BAGUNI)**, package 버전은 1.4.9입니다. 저장소 경로와 package.json의 원본 저장소 이름(`redgoose-dev/baguni`)이 다를 수 있습니다.

## 읽는 순서

1. [구조와 데이터 흐름](architecture.md): 기능, 주요 파일, DB와 API, 인증·파일 처리.
2. [개발·운영](development.md): 설치, 실행, 환경변수, 배포, 의존성 변경.
3. [테스트](testing.md): 에이전트가 실행할 명령, 임시 데이터, 검증 범위.
4. [유지보수와 이번 변경](maintenance.md): DB 연결 개선 근거, 운영 규칙, 후속 과제.

## 다음 세션에서 바로 시작하기

```sh
git status --short
bun install --frozen-lockfile
bun test tests/
bun run build
```

사용자의 기존 변경을 먼저 확인하고, 운영 `data/`나 `.env.local`을 테스트에 사용하지 않습니다. 처음 읽을 코드는 `server/main.js`, `server/libs/db.js`, `server/libs/service.js`, `server/routes/index.js`, `client/router/index.js`, `client/store/index.js`입니다. 환경변수는 일부 모듈에서 import 시 고정되므로 테스트에서는 import 전에 설정합니다.

2026-10-22 작업에서는 요청별 DB 연결 생성·종료를 서버 수명에 맞춘 연결 재사용으로 변경하고, 직접 의존성 13개를 업데이트했습니다. 테스트는 `tests/`에 저장하며 Docker 빌드 컨텍스트에서 제외합니다. 검증 상세와 제한은 [테스트 문서](testing.md)에 기록합니다.
