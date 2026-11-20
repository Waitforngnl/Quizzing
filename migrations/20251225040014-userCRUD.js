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
    CREATE OR REPLACE FUNCTION create_user(
      p_username TEXT,
      p_email TEXT,
      p_password TEXT
    )
    RETURNS users AS $$
    DECLARE
      new_user users;
    BEGIN
      IF EXISTS (SELECT * FROM get_user_by_email(p_email)) THEN
        RETURN NULL;
      END IF;
      INSERT INTO users (username, email, password_hash, created_at, updated_at)
      VALUES (p_username, p_email, crypt(p_password, gen_salt('bf')), NOW(), NOW())
      RETURNING * INTO new_user;

      RETURN new_user;
    END;
    $$ LANGUAGE plpgsql;

    CREATE OR REPLACE FUNCTION update_user(
      p_id INTEGER,
      p_username TEXT,
      p_email TEXT,
      p_password TEXT,
      p_role BOOLEAN
    )
    RETURNS SETOF users AS $$
    BEGIN
      UPDATE users
      SET
        username = p_username,
        email = p_email,
        password_hash = crypt(p_password, gen_salt('bf')),
        role = p_role,
        updated_at = NOW()
      WHERE id = p_id
      RETURNING *;
    END;
    $$ LANGUAGE plpgsql;

    CREATE OR REPLACE FUNCTION get_user_by_email(input TEXT)
    RETURNS SETOF users AS $$
    BEGIN
      RETURN QUERY
      SELECT * FROM users
      WHERE email = input;
    END;
    $$ LANGUAGE plpgsql;
    
    CREATE OR REPLACE FUNCTION get_user_by_id(input INTEGER)
    RETURNS SETOF users AS $$
    BEGIN
      RETURN QUERY
      SELECT * FROM users
      WHERE email = input;
    END;
    $$ LANGUAGE plpgsql;
    
    CREATE OR REPLACE FUNCTION delete_user(p_id INTEGER)
    RETURNS VOID AS $$
    BEGIN
      DELETE FROM users WHERE id = p_id;
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
