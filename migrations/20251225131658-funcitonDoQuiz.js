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
    CREATE OR REPLACE FUNCTION start_quiz_attempt(p_user_id INTEGER, p_quiz_id INTEGER)
  RETURNS SETOF quiz_attempts AS $$
  DECLARE
    new_attempt quiz_attempts%ROWTYPE;
  BEGIN
    INSERT INTO quiz_attempts (user_id, quiz_id, started_at, status)
    VALUES (p_user_id, p_quiz_id, NOW(), 'in_progress')
    RETURNING * INTO new_attempt;
    RETURN NEXT new_attempt;
  END;
  $$ LANGUAGE plpgsql;

  /* 4. FUNCTION: SUBMIT/SAVE ANSWER */
  CREATE OR REPLACE FUNCTION save_quiz_answer(
    p_attempt_id INTEGER,
    p_question_id INTEGER,
    p_answer JSONB,
    p_is_correct BOOLEAN,
    p_score NUMERIC
  )
  RETURNS VOID AS $$
  BEGIN
    -- Upsert: Update if exists, Insert if new
    INSERT INTO quiz_answers (attempt_id, question_id, user_answer, is_correct, score)
    VALUES (p_attempt_id, p_question_id, p_answer, p_is_correct, p_score)
    ON CONFLICT DO NOTHING; -- Simply ignore duplicates or use UPDATE if you want to allow changing answers
  END;
  $$ LANGUAGE plpgsql;

  /* 5. FUNCTION: FINISH QUIZ (Update Score & Status) */
  CREATE OR REPLACE FUNCTION finish_quiz_attempt(
    p_attempt_id INTEGER,
    p_total_score NUMERIC,
    p_max_score NUMERIC
  )
  RETURNS VOID AS $$
  BEGIN
    UPDATE quiz_attempts
    SET completed_at = NOW(),
        score = p_total_score,
        total_possible_score = p_max_score,
        status = 'completed'
    WHERE id = p_attempt_id;
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
