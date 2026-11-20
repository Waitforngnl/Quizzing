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

exports.up = function(db) {
  return db.runSql(`
    CREATE OR REPLACE FUNCTION generate_access_code(p_length INTEGER DEFAULT 8)
    RETURNS TEXT AS $$
    DECLARE
      chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      code TEXT := '';
      i INTEGER;
    BEGIN
      LOOP
        code := '';
        FOR i IN 1..p_length LOOP
          code := code || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
        END LOOP;

        EXIT WHEN NOT EXISTS (SELECT 1 FROM quizzes WHERE access_code = code);
      END LOOP;
      RETURN code;
    END;
    $$ LANGUAGE plpgsql;

    CREATE OR REPLACE FUNCTION create_quiz(
      p_user_id INTEGER,
      p_name TEXT,
      p_status VARCHAR DEFAULT 'draft',
      p_started_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
      p_ended_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
    )
    RETURNS SETOF quizzes AS $$    
    DECLARE
      new_quiz quizzes%ROWTYPE;
    BEGIN
      INSERT INTO quizzes (user_id, name, status, started_at, ended_at, created_at, updated_at)
      VALUES (p_user_id, p_name, p_status, p_started_at, p_ended_at, NOW(), NOW())
      RETURNING * INTO new_quiz;

      RETURN NEXT new_quiz;
    END;
    $$ LANGUAGE plpgsql;


    CREATE OR REPLACE FUNCTION update_quiz(
      p_id INTEGER,
      p_name TEXT,
      p_status VARCHAR,
      p_access_code VARCHAR,
      p_started_at TIMESTAMP WITH TIME ZONE,
      p_ended_at TIMESTAMP WITH TIME ZONE
    )
    RETURNS SETOF quizzes AS $$
    BEGIN
      UPDATE quizzes
      SET name = p_name,
          status = p_status,
          access_code = p_access_code,
          started_at = p_started_at,
          ended_at = p_ended_at,
          updated_at = NOW()
      WHERE id = p_id
      RETURNING *;
    END;
    $$ LANGUAGE plpgsql;

    ALTER TABLE quizzes
    ALTER COLUMN access_code
    SET DEFAULT generate_access_code(8);

    CREATE OR REPLACE FUNCTION delete_quiz(p_id INTEGER)
    RETURNS VOID AS $$
    BEGIN
      DELETE FROM quizzes WHERE id = p_id;
    END;
    $$ LANGUAGE plpgsql;

    CREATE OR REPLACE FUNCTION get_quiz_by_access_code(p_accesscode VARCHAR)
    RETURNS SETOF quizzes AS $$
    BEGIN
      RETURN QUERY
      SELECT * FROM quizzes
      WHERE access_code = p_accesscode; 
    END;
    $$ LANGUAGE plpgsql;

    CREATE OR REPLACE FUNCTION get_quiz_by_id(p_id INTEGER)
    RETURNS SETOF quizzes AS $$
    BEGIN
      RETURN QUERY SELECT * FROM quizzes WHERE id = p_id;
    END;
    $$ LANGUAGE plpgsql;

    CREATE OR REPLACE FUNCTION get_quizzes_by_user(p_user_id INTEGER)
    RETURNS SETOF quizzes AS $$
    BEGIN
      RETURN QUERY SELECT * FROM quizzes WHERE user_id = p_user_id ORDER BY created_at DESC;
    END;
    $$ LANGUAGE plpgsql;

    CREATE OR REPLACE FUNCTION get_quizzes_by_name(p_name TEXT)
    RETURNS SETOF quizzes AS $$
    BEGIN
      RETURN QUERY
      SELECT * FROM quizzes
      WHERE name ILIKE '%' || p_name || '%'
      ORDER BY created_at DESC;
    END;
    $$ LANGUAGE plpgsql;
  `);
};
exports.down = function(db) {
  return null;
};

exports._meta = {
  "version": 1
};
