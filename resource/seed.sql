-- Assets data
CREATE TABLE `asset` (
  `id` INTEGER NOT NULL UNIQUE,
  `title` TEXT NULL,
  `description` TEXT NULL,
  `type` TEXT NULL,
  `json` TEXT NULL,
  `regdate` TEXT NOT NULL,
  `updated_at` TEXT NOT NULL,
  PRIMARY KEY (`id` AUTOINCREMENT)
);

-- Collection data
CREATE TABLE `collection` (
  `id` INTEGER NOT NULL UNIQUE,
  `title` TEXT NOT NULL,
  `description` TEXT NULL,
  `regdate` TEXT NOT NULL,
  `updated_at` TEXT NOT NULL,
  PRIMARY KEY (`id` AUTOINCREMENT)
);

-- File data
CREATE TABLE `file` (
  `id` INTEGER NOT NULL UNIQUE,
  `path` TEXT NOT NULL, -- 파일이 저장되어있는 경로
  `name` TEXT NOT NULL, -- 파일이름
  `type` TEXT NOT NULL, -- 파일 타입
  `size` INTEGER NOT NULL, -- 파일 용량
  `meta` TEXT NOT NULL DEFAULT '{}', -- 파일의 정보 (날짜,이미지사이즈)
  `regdate` TEXT NOT NULL,
  `updated_at` TEXT NOT NULL,
  PRIMARY KEY (`id` AUTOINCREMENT)
);

-- Tag data
CREATE TABLE `tag` (
  `id` INTEGER NOT NULL UNIQUE,
  `name` TEXT NOT NULL UNIQUE,
  PRIMARY KEY (`id` AUTOINCREMENT)
);

-- User data
CREATE TABLE `user` (
  `id` INTEGER NOT NULL UNIQUE,
  `email` TEXT NOT NULL UNIQUE,
  `name` TEXT NOT NULL,
  `password` TEXT NOT NULL UNIQUE,
  `json` TEXT NOT NULL DEFAULT '{}',
  `mode` TEXT NULL,
  `regdate` TEXT NOT NULL,
  PRIMARY KEY (`id` AUTOINCREMENT)
);

-- Share
CREATE TABLE `share` (
  `id` INTEGER NOT NULL UNIQUE,
  `code` TEXT NOT NULL UNIQUE,
  `asset` INTEGER NOT NULL UNIQUE,
  `regdate` TEXT NOT NULL,
  PRIMARY KEY (`id` AUTOINCREMENT),
  FOREIGN KEY (`asset`) REFERENCES `asset` (`id`)
);

-- asset/file 매핑 테이블
CREATE TABLE `map_asset_file` (
  `id` INTEGER NOT NULL UNIQUE,
  `asset` INTEGER NOT NULL, -- asset 테이블 ID
  `file` INTEGER NOT NULL UNIQUE, -- file 테이블 ID
  `type` TEXT NULL, -- 메인 데이터인지에 대한 플래그 (fileTypes)
  PRIMARY KEY (`id` AUTOINCREMENT),
  FOREIGN KEY (`asset`) REFERENCES `asset` (`id`),
  FOREIGN KEY (`file`) REFERENCES `file` (`id`)
);

-- asset/tag 매핑 테이블
CREATE TABLE `map_asset_tag` (
  `id` INTEGER NOT NULL UNIQUE,
  `asset` INTEGER NOT NULL, -- asset 테이블 ID
  `tag` INTEGER NOT NULL, -- tag 테이블 ID
  PRIMARY KEY (`id` AUTOINCREMENT),
  FOREIGN KEY (`asset`) REFERENCES `asset` (`id`),
  FOREIGN KEY (`tag`) REFERENCES `tag` (`id`)
);

-- collection/file 매핑 테이블
CREATE TABLE `map_collection_file` (
  `id` INTEGER NOT NULL UNIQUE,
  `collection` INTEGER NOT NULL, -- collection 테이블 ID
  `file` INTEGER NOT NULL, -- file 테이블 ID
  `type` TEXT NULL, -- 메인 데이터인지에 대한 플래그 (fileTypes)
  PRIMARY KEY (`id` AUTOINCREMENT),
  FOREIGN KEY (`collection`) REFERENCES `collection` (`id`),
  FOREIGN KEY (`file`) REFERENCES `file` (`id`)
);

-- collection/asset 매핑 테이블
CREATE TABLE `map_collection_asset` (
  `id` INTEGER NOT NULL UNIQUE,
  `collection` INTEGER NOT NULL, -- collection 테이블 ID
  `asset` INTEGER NOT NULL, -- asset 테이블 ID
  PRIMARY KEY (`id` AUTOINCREMENT),
  FOREIGN KEY (`collection`) REFERENCES `collection` (`id`),
  FOREIGN KEY (`asset`) REFERENCES `asset` (`id`)
);

-- Asset 소유자
CREATE TABLE `owner` (
  `id` INTEGER NOT NULL UNIQUE,
  `user` INTEGER NOT NULL, -- user 테이블 ID
  `asset` INTEGER NOT NULL UNIQUE, -- asset 테이블 ID
  `public` INTEGER NOT NULL DEFAULT 0, -- 공개여부
  PRIMARY KEY (`id` AUTOINCREMENT),
  FOREIGN KEY (`user`) REFERENCES `user` (`id`),
  FOREIGN KEY (`asset`) REFERENCES `asset` (`id`)
);

-- refresh tokens
CREATE TABLE `tokens` (
  `id` INTEGER NOT NULL UNIQUE,
  `refresh` TEXT NOT NULL UNIQUE,
  `access` TEXT NOT NULL UNIQUE,
  `expired` TEXT NOT NULL,
  `regdate` TEXT NOT NULL,
  PRIMARY KEY (`id` AUTOINCREMENT)
);
