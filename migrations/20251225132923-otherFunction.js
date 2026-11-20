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
  return db.runSQL(`
    CREATE OR REPLACE FUNCTION get_popular_quizzes(limit_count INTEGER)
    RETURNS TABLE (
      id INTEGER, 
      name TEXT, 
      status VARCHAR, 
      started_at TIMESTAMPTZ, 
      ended_at TIMESTAMPTZ, 
      user_username VARCHAR, 
      attempt_count BIGINT
    ) AS $$
    BEGIN
      RETURN QUERY
      SELECT 
        q.id, 
        q.name, 
        q.status::VARCHAR,
        q.started_at, 
        q.ended_at, 
        u.username::VARCHAR as user_username,
        COUNT(qa.id) as attempt_count
      FROM quizzes q
      JOIN users u ON q.user_id = u.id
      LEFT JOIN quiz_attempts qa ON q.id = qa.quiz_id
      WHERE q.status = 'published'
      GROUP BY q.id, u.username
      ORDER BY attempt_count DESC
      LIMIT limit_count;
    END;
    $$ LANGUAGE plpgsql;

    CREATE OR REPLACE FUNCTION get_quiz_stats_overview(p_quiz_id INTEGER)
    RETURNS TABLE (
      total_attempts BIGINT,
      avg_score NUMERIC,
      highest_score NUMERIC,
      pass_rate NUMERIC -- Assuming pass is > 50% score
    ) AS $$
    BEGIN
      RETURN QUERY
      SELECT 
        COUNT(*),
        ROUND(AVG(score), 2),
        MAX(score),
        ROUND((COUNT(*) FILTER (WHERE score >= (total_possible_score / 2))::NUMERIC / NULLIF(COUNT(*), 0) * 100), 2)
      FROM quiz_attempts
      WHERE quiz_id = p_quiz_id AND status = 'completed';
    END;
    $$ LANGUAGE plpgsql;

    CREATE OR REPLACE FUNCTION get_user_quiz_history(p_user_id INTEGER)
    RETURNS TABLE (
      attempt_id INTEGER,
      quiz_name TEXT,   
      score NUMERIC,
      started_at TIMESTAMP,
      status VARCHAR
    ) AS $$
    BEGIN
      RETURN QUERY
      SELECT 
        qa.id, 
        q.name::TEXT,  
        qa.score, 
        qa.started_at::TIMESTAMP
        qa.status::VARCHAR   
      FROM quiz_attempts qa
      JOIN quizzes q ON qa.quiz_id = q.id
      WHERE qa.user_id = p_user_id
      ORDER BY qa.started_at DESC;
    END;
    $$ LANGUAGE plpgsql;

    /* FUNCTION: GET LEADERBOARD (Top Users) */
    CREATE OR REPLACE FUNCTION get_quiz_leaderboard(p_quiz_id INTEGER)
    RETURNS TABLE (
      username VARCHAR,
      score NUMERIC,
      completed_at TIMESTAMP
    ) AS $$
    BEGIN
      RETURN QUERY
      SELECT u.username, qa.score, qa.completed_at
      FROM quiz_attempts qa
      JOIN users u ON qa.user_id = u.id
      WHERE qa.quiz_id = p_quiz_id AND qa.status = 'completed'
      ORDER BY qa.score DESC, qa.completed_at ASC
      LIMIT 10;
    END;
    $$ LANGUAGE plpgsql;

    CREATE OR REPLACE FUNCTION get_quiz_question_stats(p_quiz_id INTEGER)
    RETURNS TABLE (
      question_id INTEGER,
      content TEXT,
      correct_count BIGINT,
      incorrect_count BIGINT,
      total_answers BIGINT
    ) AS $$
    BEGIN
      RETURN QUERY
      SELECT 
        q.id,
        q.content::TEXT,
        COUNT(CASE WHEN qa.is_correct THEN 1 END) as correct_count,
        COUNT(CASE WHEN NOT qa.is_correct THEN 1 END) as incorrect_count,
        COUNT(qa.id) as total_answers
      FROM questions q
      LEFT JOIN quiz_answers qa ON q.id = qa.question_id
      WHERE q.quiz_id = p_quiz_id
      GROUP BY q.id, q.content
      ORDER BY q.id;
    END;
    $$ LANGUAGE plpgsql;

    CREATE OR REPLACE FUNCTION get_quiz_attempts_list(p_quiz_id INTEGER)
    RETURNS TABLE (
      attempt_id INTEGER,
      username TEXT,
      score NUMERIC,
      started_at TIMESTAMP,
      status VARCHAR
    ) AS $$
    BEGIN
      RETURN QUERY
      SELECT 
        att.id,
        u.username::TEXT,
        att.score,
        att.started_at::TIMESTAMP,
        att.status::VARCHAR
      FROM quiz_attempts att
      JOIN users u ON att.user_id = u.id
      WHERE att.quiz_id = p_quiz_id
      ORDER BY att.started_at DESC;
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
