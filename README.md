# 바구니(BAGUNI)

웹 프로그램 `바구니`는 이미지나 파일들을 저장하고 탐색하고 보관하기 위하여 만들어진 프로그램입니다.

스크랩하는 이미지 데이터들을 간편하게 저장하고 싶었던것이 이 프로그램을 만들게 된 계기였습니다. Goose 프로그램에서 스크랩 일도 해왔었지만 포스팅 용도로 만들어진 프로그램에서 저장하고 보관하는 일은 적합하지 않고, 새로운 공간을 만들어서 캡슐화 시키고 싶었습니다.

이 프로그램의 특징은 다음과 같습니다.

- 데이터를 독립적으로 캡슐화
- 웹서버에서 운영하기 때문에 웹 브라우저로 어디서든지 사용할 수 있습니다.
- 개인적인 공간
- 빠른 파일 업로드
- 썸네일 이미지 목록으로 데이터 탐색


## Install

이 프로그램은 백엔드 영역부터 `node.js`가 아닌 [Bun](https://bun.sh/)을 사용하고 있습니다. 그래서 로컬 호스트에서 사용해보려면 먼저 `Bun`이 설치되어 있어야 합니다.

다음과 같이 설치할 수 있습니다.

```shell
git clone https://github.com/redgoose-dev/baguni.git
cd baguni
bun install
bun run app:install
```


## Usage

### Development

설치후에 개발모드로 실행하려면 다음과 같이 실행합니다.

```shell
bun run dev
```

만약 서버 포트를 바꾸고 싶다면 `.env.local` 파일을 열어서 `PORT="4200"` 항목을 추가하거나 수정하면 됩니다.
이 프로젝트는 하나의 서버에서 프론트엔드와 백엔드 영역 둘다 사용하고 있습니다.

- `/client`: 프론트엔드 영역
- `/server`: 백엔드 영역

### Production

배포를 위한 빌드를 하려면 다음과 같이 실행합니다.

```shell
bun run build
```

그리고 빌드된 운영모드로 서버를 열어보려면 다음과 같이 실행합니다.

```shell
bun run preview
```


## Docker

`바구니`는 도커 이미지로 만들어져 있어서 곧바로 컨테이너를 띄울 수 있습니다.  
도커 이미지 주소는 https://hub.docker.com/r/redgoose/baguni 입니다.

커멘드에서 다음과 같이 컨테이너를 생성하고 시작할 수 있습니다.

```shell
docker run \
  -n baguni \
  -p 3000:80 \
  -v ./data:/app/data \
  -v ./.env.docker:/app/.env.local \
  redgoose/baguni:latest
```

컨테이너를 만들때 참고할 부분은 다음과 같습니다.

- 컨테이너가 만들어질때 내부에서 프로그램을 빌드하고 로컬서버를 띄웁니다. 포트는 80
- 서버가 열리면 최초에 `docker exec -it baguni bun run app:install` 명령을 실행하여 앱 설치를 합니다. 설치가 완료되면 `/data` 디렉토리가 만들어집니다.
- `-v` 파라메터로 설치한 장소와 컨테이너의 장소를 볼륨화 시킬 수 있습니다. 예제와 같이 최소한 `/app/data`와 `/app/.env.local` 두개만 존재하면 됩니다.

docker-compose.yml 파일의 모습은 다음과 같습니다.

```yaml
services:
  keep:
    container_name: baguni
    image: redgoose/baguni:latest
    volumes:
      - ./.env:/app/.env.local
      - ./data:/app/data
    ports:
      - '3000:80'
```


## Support

모든것은 오픈소스이기 때문에 입맛대로 뜯어고치고 사용하셔도 됩니다.  
만약 잘 안되는것이나 궁금한 점이 있다면 [Issue](https://github.com/redgoose-dev/baguni/issues)에다 글 남겨주세요.
