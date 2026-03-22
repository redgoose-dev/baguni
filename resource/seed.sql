-- assets data
CREATE TABLE `asset` (
  `id` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
  `title` TEXT,
  `description` TEXT,
  `type` TEXT,
  `json` TEXT,
  `mode` TEXT DEFAULT 'private' NOT NULL, -- public,private
  `created_at` TEXT NOT NULL,
  `updated_at` TEXT NOT NULL
);

-- collection data
CREATE TABLE `collection` (
  `id` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
  `title` TEXT, -- 제목
  `description` TEXT, -- 설명
  `created_at` TEXT NOT NULL
);

-- file data
CREATE TABLE `file` (
  `id` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
  `path` TEXT NOT NULL, -- 파일이 저장되어있는 경로
  `name` TEXT NOT NULL, -- 파일이름
  `type` TEXT NOT NULL, -- 파일 타입
  `size` INTEGER NOT NULL, -- 파일 용량
  `meta` TEXT DEFAULT '{}' NOT NULL, -- 파일의 정보 (날짜,이미지사이즈)
  `module` TEXT NOT NULL, -- 모듈 (asset,collection)
  `module_id` INTEGER NOT NULL, -- 모듈 ID
  `mode` TEXT, -- 파일의 성격 (main,cover-origin,cover-create,body)
  `created_at` TEXT NOT NULL
);

-- tag data
CREATE TABLE `tag` (
  `id` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
  `name` TEXT NOT NULL UNIQUE
);

-- share
CREATE TABLE `share` (
  `id` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
  `code` TEXT NOT NULL UNIQUE,
  `asset` INTEGER NOT NULL UNIQUE REFERENCES `asset`,
  `created_at` TEXT NOT NULL
);

-- collection/asset 매핑 테이블
CREATE TABLE `map_collection_asset` (
  `id` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
  `collection` INTEGER REFERENCES `collection`, -- collection 테이블 ID
  `asset` INTEGER REFERENCES `asset` -- asset 테이블 ID
);

-- asset/tag 매핑 테이블
CREATE TABLE `map_asset_tag` (
  `id` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
  `asset` INTEGER REFERENCES `asset`, -- asset 테이블 ID
  `tag` INTEGER REFERENCES `tag` -- tag 테이블 ID
);

-- table `provider`
CREATE TABLE `provider` (
  `id` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
  `code` TEXT NOT NULL, -- provider name (password)
  `user_id` TEXT NOT NULL, -- user id
  `user_name` TEXT, -- user name
  `user_avatar` TEXT, -- user avatar
  `user_email` TEXT, -- user email
  `user_password` TEXT, -- user password (for code=password)
  `created_at` TEXT NOT NULL -- created date
);

-- tokens
CREATE TABLE `tokens` (
  `id` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
  `refresh` TEXT NOT NULL UNIQUE,
  `access` TEXT NOT NULL UNIQUE,
  `name` TEXT,
  `expired` TEXT NOT NULL,
  `created_at` TEXT NOT NULL
);
