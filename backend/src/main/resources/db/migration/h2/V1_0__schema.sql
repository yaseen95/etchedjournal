CREATE TABLE keypairs (
  id          BIGINT        PRIMARY KEY,
  timestamp   TIMESTAMP     NOT NULL,
  public_key  BINARY        NOT NULL,
  private_key BINARY        NOT NULL,
  owner       VARCHAR(60)   NOT NULL,
  owner_type  VARCHAR(50)   NOT NULL,

  /* bcrypt salt is 22 chars
  https://web.archive.org/web/20180814110458/https://asecuritysite.com/encryption/bcrypt
  */
  salt        VARCHAR(22)   NOT NULL,
  iterations  INT           NOT NULL,
  _version    INT           NOT NULL,
);

CREATE TABLE journals (
  id          BIGINT        PRIMARY KEY,
  timestamp   TIMESTAMP     NOT NULL,
  content     BINARY        NOT NULL,
  -- TODO: Make `owner` a UUID column
  owner       VARCHAR(60)   NOT NULL,
  owner_type  VARCHAR(50)   NOT NULL,
  key_pair_id BIGINT        NOT NULL,
  _version    INT           NOT NULL,
  FOREIGN KEY (key_pair_id) REFERENCES keypairs (id)
);

CREATE TABLE entries (
  id          BIGINT        PRIMARY KEY,
  timestamp   TIMESTAMP     NOT NULL,
  content     BINARY        NOT NULL,
  owner       VARCHAR(60)   NOT NULL,
  owner_type  VARCHAR(50)   NOT NULL,
  journal_id  BIGINT        NOT NULL,
  key_pair_id BIGINT        NOT NULL,
  _version    INT           NOT NULL,
  FOREIGN KEY (journal_id) REFERENCES journals (id),
  FOREIGN KEY (key_pair_id) REFERENCES keypairs (id)
);

CREATE TABLE etches (
  id          BIGINT        PRIMARY KEY,
  timestamp   TIMESTAMP     NOT NULL,
  content     BINARY        NOT NULL,
  owner       VARCHAR(60)   NOT NULL,
  owner_type  VARCHAR(50)   NOT NULL,
  entry_id    BIGINT        NOT NULL,
  key_pair_id BIGINT        NOT NULL,
  _version    INT           NOT NULL,
  FOREIGN KEY (entry_id) REFERENCES entries (id),
  FOREIGN KEY (key_pair_id) REFERENCES keypairs (id)
);
