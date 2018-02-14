CREATE TABLE users (
  user_id    BIGINT                       IDENTITY PRIMARY KEY,
  // TODO: Enforce username rules in app logic e.g. starts with letter, etc.
  username   VARCHAR(30) UNIQUE  NOT NULL,
  password   VARCHAR(60)         NOT NULL, // bcrypt stretches to 60 chars
  email      VARCHAR(320) UNIQUE NOT NULL, // 320 max allowed length RFC 5321
  admin      BOOL                NOT NULL DEFAULT FALSE,

  // Fields below are all for deriving master key.
  algo       VARCHAR(10)                  DEFAULT NULL,
  salt       VARCHAR(255)                 DEFAULT NULL,
  key_size   INT                          DEFAULT NULL,
  iterations BIGINT                       DEFAULT NOT NULL
);

CREATE TABLE entries (
  entry_id BIGINT    IDENTITY PRIMARY KEY,
  title    VARCHAR(255) NOT NULL,
  created  TIMESTAMP    NOT NULL,
  finished TIMESTAMP DEFAULT NULL,
  state    VARCHAR(30)  NOT NULL,
  user_id  BIGINT       NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users (user_id)
);

CREATE TABLE etches (
  etch_id     BIGINT IDENTITY PRIMARY KEY,
  timestamp   TIMESTAMP    NOT NULL,
  position    INT          NOT NULL,
  content     VARCHAR(MAX) NOT NULL,
  entry_id    BIGINT       NOT NULL,
  content_key VARCHAR(255) NOT NULL,
  content_iv  VARCHAR(255) NOT NULL,
  init_vector VARCHAR(255) NOT NULL,
  FOREIGN KEY (entry_id) REFERENCES entries (entry_id)
);

