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
    CREATE OR REPLACE FUNCTION create_question(
      p_content TEXT,
      p_type qes_type,
      p_quiz_id INTEGER,
      p_data JSONB DEFAULT '{}'::jsonb
    )
    RETURNS SETOF questions AS $$
    DECLARE
      new_question questions%ROWTYPE;
      q_count INTEGER;
    BEGIN
      SELECT COUNT(*) INTO q_count 
      FROM questions 
      WHERE quiz_id = p_quiz_id AND type = p_type;

      INSERT INTO questions (quiz_id, name, type, content, data, created_at, updated_at)
      VALUES (
        p_quiz_id,
        p_type || '_' || (q_count + 1),
        p_type,
        p_content,
        p_data,
        NOW(),
        NOW()
      )
      RETURNING * INTO new_question;
      RETURN NEXT new_question;
    END;
    $$ LANGUAGE plpgsql;

    CREATE OR REPLACE FUNCTION update_question(
      p_id INTEGER,
      p_content TEXT,
      p_type TEXT, 
      p_data JSONB
    )
    RETURNS SETOF questions AS $$
    DECLARE
      updated_row questions%ROWTYPE;
    BEGIN
      UPDATE questions
      SET content = p_content,
          type = p_type::qes_type,
          data = p_data,
          updated_at = NOW()
      WHERE id = p_id
      RETURNING * INTO updated_row;

      IF FOUND THEN
          RETURN NEXT updated_row;
      END IF;
    END;
    $$ LANGUAGE plpgsql;

    CREATE OR REPLACE FUNCTION get_question_by_id(input INTEGER)
    RETURNS SETOF questions AS $$
    BEGIN
      RETURN QUERY
      SELECT * FROM questions
      WHERE id = input;
    END;
    $$ LANGUAGE plpgsql;
    
    CREATE OR REPLACE FUNCTION get_question_in_quiz(input INTEGER)
    RETURNS SETOF questions AS $$
    BEGIN
      RETURN QUERY
      SELECT * FROM questions
      WHERE quiz_id = input;
    END;
    $$ LANGUAGE plpgsql;

    CREATE OR REPLACE FUNCTION delete_question(p_id INTEGER)
    RETURNS VOID AS $$
    BEGIN
      DELETE FROM questions WHERE id = p_id;
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
