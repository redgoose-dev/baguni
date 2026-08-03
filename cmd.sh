#!/bin/sh

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
cd "$SCRIPT_DIR"

IMAGE_REPOSITORY="redgoose/baguni"
GIT_TAG_PREFIX="v"
LAST_PUBLISHED_VERSION_FILE="tmp/.baguni-last-published-version"

get_package_version() {
  bun -e '
    const packageJson = await Bun.file("package.json").json()

    if (typeof packageJson.version !== "string" || packageJson.version.length === 0) {
      throw new Error("package.json version is missing")
    }

    console.log(packageJson.version)
  '
}

get_last_published_version() {
  if [ -f "$LAST_PUBLISHED_VERSION_FILE" ]; then
    cat "$LAST_PUBLISHED_VERSION_FILE"
  fi
}

ensure_git_tag() {
  VERSION="$1"
  GIT_TAG="${GIT_TAG_PREFIX}${VERSION}"
  HEAD_COMMIT="$(git rev-parse HEAD)"
  REMOTE_MAIN_COMMIT="$(git rev-parse --verify refs/remotes/origin/main)"

  if [ "$HEAD_COMMIT" != "$REMOTE_MAIN_COMMIT" ]; then
    echo "Local HEAD is not the latest origin/main; skipping Git tag"
    return 0
  fi

  if git show-ref --verify --quiet "refs/tags/${GIT_TAG}"; then
    TAG_COMMIT="$(git rev-list -n 1 "$GIT_TAG")"

    if [ "$TAG_COMMIT" != "$REMOTE_MAIN_COMMIT" ]; then
      echo "Git tag ${GIT_TAG} already exists at another commit; skipping"
      return 0
    fi

    echo "Git tag already exists: ${GIT_TAG}"
  else
    git tag "$GIT_TAG" "$REMOTE_MAIN_COMMIT"
    echo "Created Git tag: ${GIT_TAG}"
  fi

  git push origin "$GIT_TAG"
}

publish() {
  VERSION="$(get_package_version)"
  LAST_PUBLISHED_VERSION="$(get_last_published_version)"

  set -- buildx build \
    --platform linux/amd64,linux/arm64 \
    --force-rm \
    --tag "${IMAGE_REPOSITORY}:latest"

  if [ -z "$LAST_PUBLISHED_VERSION" ] || [ "$VERSION" != "$LAST_PUBLISHED_VERSION" ]; then
    echo "Version changed: ${LAST_PUBLISHED_VERSION:-none} -> ${VERSION}"
    set -- "$@" --tag "${IMAGE_REPOSITORY}:${VERSION}"
  else
    echo "Version unchanged: ${VERSION}; latest tag only"
  fi

  set -- "$@" --push .

  echo "Publishing ${IMAGE_REPOSITORY}:${VERSION}"

  docker "$@"

  mkdir -p "$(dirname "$LAST_PUBLISHED_VERSION_FILE")"
  printf '%s\n' "$VERSION" > "$LAST_PUBLISHED_VERSION_FILE"

  docker image prune -f
}

case "${1:-}" in

  pull)
    PREVIOUS_PACKAGE_VERSION="$(get_package_version)"

    git status --short
    git pull --ff-only origin main
    git fetch --tags origin

    CURRENT_PACKAGE_VERSION="$(get_package_version)"
    echo "Current package version: ${CURRENT_PACKAGE_VERSION}"

    if [ "$PREVIOUS_PACKAGE_VERSION" != "$CURRENT_PACKAGE_VERSION" ]; then
      echo "Package version changed: ${PREVIOUS_PACKAGE_VERSION} -> ${CURRENT_PACKAGE_VERSION}"
    fi

    # Local tag가 이미 있어도 GitHub에 없을 수 있으므로 항상 원격 동기화를 시도한다.
    ensure_git_tag "$CURRENT_PACKAGE_VERSION"
    ;;

  publish)
    publish
    ;;

  *)
    echo "Usage: ./cmd.sh {pull|publish}" >&2
    exit 3
    ;;

esac
