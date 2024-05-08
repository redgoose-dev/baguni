-- Assets data
CREATE TABLE `asset` (
  `id` INTEGER NOT NULL UNIQUE,
  `title` TEXT NOT NULL,
  `description` TEXT NULL,
  `json` TEXT NOT NULL DEFAULT '{}',
  `regdate` TEXT NOT NULL,
  `update` TEXT NOT NULL,
  PRIMARY KEY (`id` AUTOINCREMENT)
);

-- Collection data
CREATE TABLE `collection` (
  `id` INTEGER NOT NULL UNIQUE,
  `title` TEXT NOT NULL,
  `description` TEXT NULL,
  `cover_url` TEXT NULL, -- 커버 이미지 URL
  `regdate` TEXT NOT NULL,
  `update` TEXT NOT NULL,
  PRIMARY KEY (`id` AUTOINCREMENT)
);

-- Files data
CREATE TABLE `file` (
  `id` INTEGER NOT NULL UNIQUE,
  `path` TEXT NOT NULL, -- 파일이 저장되어있는 경로
  `meta` TEXT NOT NULL DEFAULT '{}', -- 파일의 정보 (이름,타입,사이즈,날짜,이미지사이즈)
  `regdate` TEXT NOT NULL,
  `update` TEXT NOT NULL,
  PRIMARY KEY (`id` AUTOINCREMENT)
);

-- Tag data
CREATE TABLE `tag` (
  `id` INTEGER NOT NULL UNIQUE,
  `name` TEXT NOT NULL UNIQUE,
  PRIMARY KEY (`id` AUTOINCREMENT)
);

-- User data
CREATE TABLE `user`
(
  `id` INTEGER NOT NULL UNIQUE,
  `email` TEXT NULL UNIQUE,
  `password` TEXT NULL UNIQUE,
  `name` TEXT NULL,
  `regdate` TEXT NULL,
  PRIMARY KEY (`id` AUTOINCREMENT)
);

-- asset, collection 매핑 테이블
CREATE TABLE `map_asset_collection` (
  `id` INTEGER NOT NULL UNIQUE,
  `asset` INTEGER NOT NULL, -- asset 테이블 id
  `collection` INTEGER NOT NULL UNIQUE, -- collection 테이블 id
  PRIMARY KEY (`id` AUTOINCREMENT),
  FOREIGN KEY (`collection`) REFERENCES `collection` (`id`),
  FOREIGN KEY (`asset`) REFERENCES `asset` (`id`)
);

-- asset, file 매핑 테이블
CREATE TABLE `map_asset_file` (
  `id` INTEGER NOT NULL UNIQUE,
  `asset` INTEGER NOT NULL, -- asset 테이블 id
  `file` INTEGER NOT NULL UNIQUE, -- file 테이블 id
  PRIMARY KEY (`id` AUTOINCREMENT),
  FOREIGN KEY (`asset`) REFERENCES `asset` (`id`),
  FOREIGN KEY (`file`) REFERENCES `file` (`id`)
);

-- asset, tag 매핑 테이블
CREATE TABLE `map_asset_tag` (
  `id` INTEGER NOT NULL UNIQUE,
  `asset` INTEGER NOT NULL, -- asset 테이블 id
  `tag` INTEGER NOT NULL, -- tag 테이블 id
  PRIMARY KEY (`id` AUTOINCREMENT),
  FOREIGN KEY (`asset`) REFERENCES `asset` (`id`),
  FOREIGN KEY (`tag`) REFERENCES `tag` (`id`)
);

-- user, content data 권한 데이터
CREATE TABLE `permission_user_data` (
  `id` INTEGER NOT NULL UNIQUE,
  `permission` TEXT NOT NULL DEFAULT 'READ', -- 권한(READ,WRITE)
  `user` INTEGER NOT NULL, -- user 테이블 id
  `asset` INTEGER NOT NULL, -- asset 테이블 id
  `file` INTEGER NOT NULL, -- file 테이블 id
  `collection` INTEGER NOT NULL, -- collection 테이블 id
  PRIMARY KEY (`id` AUTOINCREMENT),
  FOREIGN KEY (`asset`) REFERENCES `asset` (`id`),
  FOREIGN KEY (`file`) REFERENCES `file` (`id`),
  FOREIGN KEY (`collection`) REFERENCES `collection` (`id`),
  FOREIGN KEY (`user`) REFERENCES `user` (`id`)
);
