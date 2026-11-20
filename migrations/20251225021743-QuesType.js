'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function (db) {
  return db.runSql(`
    CREATE TYPE qes_type AS ENUM (
      'multiple',        -- trắc nghiệm
      'file',            -- nộp file
      'essay',           -- tự luận dài
      'true_false',      -- đúng / sai
      'fill_blank',      -- điền chỗ trống
      'matching',        -- nối
      'short_answer',    -- trả lời ngắn
      'ordering',        -- sắp xếp
      'drag_drop',       -- kéo thả
      'listening',       -- nghe
      'speaking',        -- nói / ghi âm
      'reading',         -- đọc hiểu
      'picture',         -- dựa trên hình ảnh
      'video'            -- dựa trên video
    );
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  "version": 1
};
