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
    CREATE OR REPLACE FUNCTION enroll_user_in_quiz(p_user_id INTEGER, p_quiz_id INTEGER)
    RETURNS VOID AS $$
    BEGIN
      INSERT INTO quiz_enrollments (user_id, quiz_id)
      VALUES (p_user_id, p_quiz_id)
      ON CONFLICT DO NOTHING;
    END;
    $$ LANGUAGE plpgsql;

    /* FUNCTION: GET ENROLLED QUIZZES (For "My Class" tab) */
    CREATE OR REPLACE FUNCTION get_enrolled_quizzes(p_user_id INTEGER)
    RETURNS TABLE (
      id INTEGER,
      name TEXT,
      status VARCHAR,
      owner_name TEXT,
      enrolled_at TIMESTAMP
    ) AS $$
    BEGIN
      RETURN QUERY
      SELECT 
        q.id, 
        q.name::TEXT, 
        q.status::VARCHAR,
        u.username::TEXT as owner_name,
        qe.enrolled_at::TIMESTAMP
      FROM quiz_enrollments qe
      JOIN quizzes q ON qe.quiz_id = q.id
      JOIN users u ON q.user_id = u.id
      WHERE qe.user_id = p_user_id
      ORDER BY qe.enrolled_at DESC;
    END;
    $$ LANGUAGE plpgsql;

    /* FUNCTION: GET QUIZ MEMBERS (For Owner to see who joined) */
    CREATE OR REPLACE FUNCTION get_quiz_members(p_quiz_id INTEGER)
    RETURNS TABLE (
      username TEXT,
      enrolled_at TIMESTAMP
    ) AS $$
    BEGIN
      RETURN QUERY
      SELECT 
        u.username::TEXT,
        qe.enrolled_at::TIMESTAMP
      FROM quiz_enrollments qe
      JOIN users u ON qe.user_id = u.id
      WHERE qe.quiz_id = p_quiz_id;
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
