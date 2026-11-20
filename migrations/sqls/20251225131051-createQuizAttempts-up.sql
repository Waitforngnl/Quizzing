CREATE TABLE quiz_attempts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  quiz_id INTEGER REFERENCES quizzes(id),
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  score NUMERIC DEFAULT 0,
  total_possible_score NUMERIC DEFAULT 0,
  status VARCHAR DEFAULT 'in_progress' -- 'in_progress', 'completed', 'graded'
);