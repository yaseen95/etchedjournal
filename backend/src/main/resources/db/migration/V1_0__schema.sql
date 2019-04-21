
CREATE TABLE key_pair (
  id          BIGINT        PRIMARY KEY UNIQUE NOT NULL,
  created     TIMESTAMP     NOT NULL,
  public_key  BYTEA         NOT NULL,
  private_key BYTEA         NOT NULL,
  owner       VARCHAR(60)   NOT NULL,
  owner_type  CHAR(1)       NOT NULL,

  /* bcrypt salt is 22 chars
  https://web.archive.org/web/20180814110458/https://asecuritysite.com/encryption/bcrypt
  */
  salt        VARCHAR(22)   NOT NULL,
  iterations  INT           NOT NULL,
  version     INT           NOT NULL
);

CREATE TABLE journal (
  id          BIGINT        PRIMARY KEY UNIQUE NOT NULL,
  created     TIMESTAMP     NOT NULL,
  modified    TIMESTAMP     DEFAULT NULL,
  content     BYTEA         NOT NULL,
  -- TODO: Make `owner` a UUID column
  owner       VARCHAR(60)   NOT NULL,
  owner_type  CHAR(1)       NOT NULL,
  key_pair_id BIGINT        NOT NULL,
  version     INT           NOT NULL,
  schema      SMALLINT      NOT NULL,
  FOREIGN KEY (key_pair_id) REFERENCES key_pair (id)
);

CREATE TABLE entry (
  id          BIGINT        PRIMARY KEY UNIQUE NOT NULL,
  created     TIMESTAMP     NOT NULL,
  modified    TIMESTAMP     DEFAULT NULL,
  content     BYTEA         NOT NULL,
  owner       VARCHAR(60)   NOT NULL,
  owner_type  CHAR(1)       NOT NULL,
  journal_id  BIGINT        NOT NULL,
  key_pair_id BIGINT        NOT NULL,
  version     INT           NOT NULL,
  schema      SMALLINT      NOT NULL,
  FOREIGN KEY (journal_id) REFERENCES journal (id),
  FOREIGN KEY (key_pair_id) REFERENCES key_pair (id)
);

CREATE TABLE etch (
  id          BIGINT        PRIMARY KEY UNIQUE NOT NULL,
  created     TIMESTAMP     NOT NULL,
  content     BYTEA         NOT NULL,
  owner       VARCHAR(60)   NOT NULL,
  owner_type  CHAR(1)       NOT NULL,
  entry_id    BIGINT        NOT NULL,
  key_pair_id BIGINT        NOT NULL,
  version     INT           NOT NULL,
  schema      SMALLINT      NOT NULL,
  FOREIGN KEY (entry_id) REFERENCES entry (id),
  FOREIGN KEY (key_pair_id) REFERENCES key_pair (id)
);
