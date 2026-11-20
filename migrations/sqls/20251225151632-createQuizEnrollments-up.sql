CREATE TABLE quiz_enrollments (
  user_id INTEGER REFERENCES users(id),
  quiz_id INTEGER REFERENCES quizzes(id),
  enrolled_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, quiz_id)
);