CREATE TABLE IF NOT EXISTS quiz_answers (
  id SERIAL PRIMARY KEY,
  attempt_id INTEGER REFERENCES quiz_attempts(id),
  question_id INTEGER,
  user_answer JSONB, 
  is_correct BOOLEAN DEFAULT FALSE,
  score NUMERIC DEFAULT 0,
  CONSTRAINT unique_attempt_question UNIQUE (attempt_id, question_id) -- Prevent duplicate answers
);