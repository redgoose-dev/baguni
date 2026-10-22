# 유지보수 메모

## #75와 현재 프로젝트의 관계

사용자가 제공한 [slideshow-service #75](https://github.com/goose-service/slideshow-service/issues/75)를 2026-10-22 브라우저에서 열었으나 GitHub의 Page not found(404)가 표시되었습니다. 원문 요구사항과 최신 댓글·상태는 확인하지 못했습니다. 이슈가 삭제되었는지, 이름이 바뀌었는지, 접근 권한 문제인지는 확정하지 않습니다.

사용자가 지정한 참고 채팅 `01a162aa-4bc1-78a3-9138-27021dcf93fb`(제목: 프로젝트 분석 및 문서 정리)를 읽었습니다. 그 채팅은 `/Users/goose/dev/service/slideshow.redgoose.me`의 DB 연결 유지와 의존성 개선을 다룹니다. 현재 BAGUNI에서도 같은 패턴을 코드로 확인했으므로 공통 문제를 적용했습니다. 다른 저장소를 수정하거나 GitHub 이슈에 댓글을 게시·종료하지 않았습니다.

## 문제와 변경

이전에는 모듈 전역 DB를 라우트가 readonly/readwrite로 연결하고 finally에서 닫았습니다. 먼저 실행된 읽기 요청이 연 readonly 연결을 쓰기 요청이 재사용할 수 있고, 파일 작업을 기다리는 요청이 있는 동안 다른 요청이 공유 연결을 닫을 수 있었습니다. 반복적인 PRAGMA 설정과 연결 생성 비용도 발생합니다.

이제 설치된 서버는 하나의 읽기·쓰기 연결을 만들고 모든 요청이 재사용합니다. 설치 전 시작은 유지하고 설치 후 요청에서 연결을 엽니다. 모든 라우트의 connect/disconnect를 제거했으며 로그아웃·파일 처리도 동일한 정책입니다. 시작 실패 시 연결을 정리하고 SIGINT/SIGTERM에서는 처리 중인 요청이 끝난 뒤 닫습니다. 기존 WAL 설정은 유지했습니다. 공개 캐시 적중 시 조회를 생략하는 기존 동작은 보존됩니다.

`connect()`에 readonly/create 옵션을 전달하던 사용법은 제거했습니다. `create: false`로 없는 DB를 조용히 만들지 않습니다. API 권한은 DB readonly 모드가 아니라 기존 인증·공개 여부 검사로 통제합니다. 테스트와 검증 내용은 [테스트 문서](testing.md)를 참고합니다.

## 수정 원칙

- 라우트에서 연결을 닫거나 새로운 DB 인스턴스를 만들지 않습니다. 종료는 `shutdown()`으로 모읍니다.
- SQL 트랜잭션 안에서 파일·네트워크 await를 하지 않습니다. 필요하면 파일 준비 후 동기 DB 변경만 transaction으로 묶습니다.
- 환경변수와 Preference는 import/setup 시점에 읽습니다. 테스트 격리가 필요하면 별도 프로세스를 사용합니다.
- 기존 데이터는 seed 재실행 대신 명시적 마이그레이션으로 변경합니다.
- 의존성 갱신 시 package.json과 bun.lock을 같이 바꾸고 네이티브 이미지 처리·클라이언트 빌드도 확인합니다.

## 후속 점검 후보

이번 연결 개선과 구분되는 기존 사항입니다. 작업 요청에 맞춰 별도 범위로 해결합니다.

1. `package.json`의 `app:migrate-indexes`가 가리키는 `tmp/migrate-add-indexes.js`는 체크아웃에 없습니다. 기존 설치의 인덱스 상태를 확인한 뒤 재현 가능한 마이그레이션으로 정리할 필요가 있습니다.
2. 에셋 목록의 sort/order/tags/file_type 등 일부 SQL 문자열 보간은 allowlist와 바인딩 여부를 점검해야 합니다.
3. 비공개 파일 캐시의 토큰 일치 경로, 로그아웃·공개 상태 변경 시 캐시 무효화와 HTTP Cache-Control 정책을 함께 검토해야 합니다.
4. `onResponse`의 개발 오류 로그는 response.text()로 본문을 소비합니다. 오류 응답 전달 문제가 발생하면 clone 사용을 검토합니다.
5. 파일 캐시 쓰기·삭제의 일부 `.then()` 작업은 요청 완료 이후에도 실행될 수 있습니다. 정상 종료는 진행 중 HTTP 요청을 기다리지만 독립적인 백그라운드 작업까지 보장하지 않습니다.
6. 기존 `statics.js` catch에서 만든 응답을 response 변수에 할당하지 않는 경로와, 트랜잭션 없는 복수 DB/파일 변경은 별도 회귀 테스트와 함께 점검할 수 있습니다.
7. 장시간 요청의 종료 제한 시간과 DB 증가에 따른 mmap/cache 상한은 실제 운영 규모에 따라 정합니다. 현재 정상 종료에는 강제 타임아웃이 없습니다.

## 참고 자료

- [Bun HTTP 서버와 종료](https://bun.sh/docs/runtime/http/server)
- [Sharp 리사이즈 API](https://sharp.pixelplumbing.com/api-resize/)
- [Pinia 스토어](https://pinia.vuejs.org/core-concepts/)

공식 문서는 API 확인에 사용했고 실제 적용 버전의 호환성은 lockfile·설치된 패키지·테스트 결과로 확인했습니다.
