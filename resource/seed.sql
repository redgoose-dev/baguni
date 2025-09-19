-- Assets data
CREATE TABLE `asset` (
  `id` INTEGER NOT NULL UNIQUE,
  `title` TEXT NULL,
  `description` TEXT NULL,
  `type` TEXT NULL,
  `json` TEXT NULL,
  `mode` TEXT NOT NULL DEFAULT 'private', -- public,private
  `created_at` TEXT NOT NULL,
  `updated_at` TEXT NOT NULL,
  PRIMARY KEY (`id` AUTOINCREMENT)
);

-- Collection data
CREATE TABLE `collection` (
  `id` INTEGER NOT NULL UNIQUE,
  `title` TEXT NOT NULL, -- 제목
  `description` TEXT NULL, -- 설명
  `created_at` TEXT NOT NULL,
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
  `module` TEXT NOT NULL, -- 모듈 (asset,collection)
  `module_id` INTEGER NOT NULL, -- 모듈 ID
  `mode` TEXT NULL, -- 파일의 성격 (main,cover-origin,cover-create,body)
  `created_at` TEXT NOT NULL,
  PRIMARY KEY (`id` AUTOINCREMENT)
);

-- Tag data
CREATE TABLE `tag` (
  `id` INTEGER NOT NULL UNIQUE,
  `name` TEXT NOT NULL UNIQUE,
  PRIMARY KEY (`id` AUTOINCREMENT)
);

-- Share
CREATE TABLE `share` (
  `id` INTEGER NOT NULL UNIQUE,
  `code` TEXT NOT NULL UNIQUE,
  `asset` INTEGER NOT NULL UNIQUE,
  `created_at` TEXT NOT NULL,
  PRIMARY KEY (`id` AUTOINCREMENT),
  FOREIGN KEY (`asset`) REFERENCES `asset` (`id`)
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

-- asset/tag 매핑 테이블
CREATE TABLE `map_asset_tag` (
  `id` INTEGER NOT NULL UNIQUE,
  `asset` INTEGER NOT NULL, -- asset 테이블 ID
  `tag` INTEGER NOT NULL, -- tag 테이블 ID
  PRIMARY KEY (`id` AUTOINCREMENT),
  FOREIGN KEY (`asset`) REFERENCES `asset` (`id`),
  FOREIGN KEY (`tag`) REFERENCES `tag` (`id`)
);

-- table `provider`
CREATE TABLE `provider` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `code` TEXT NOT NULL, -- provider name (password)
  `user_id` TEXT NOT NULL, -- user id
  `user_name` TEXT NULL, -- user name
  `user_avatar` TEXT NULL, -- user avatar
  `user_email` TEXT NULL, -- user email
  `user_password` TEXT NULL, -- user password (for code=password)
  `created_at` TEXT NOT NULL -- created date
);

-- tokens
CREATE TABLE `tokens` (
  `id` INTEGER NOT NULL UNIQUE,
  `refresh` TEXT NOT NULL UNIQUE,
  `access` TEXT NOT NULL UNIQUE,
  `expired` TEXT NOT NULL,
  `created_at` TEXT NOT NULL,
  PRIMARY KEY (`id` AUTOINCREMENT)
);
