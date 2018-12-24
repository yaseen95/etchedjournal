CREATE SEQUENCE journals_id_sequence START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE entries_id_sequence START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE etches_id_sequence START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE key_pairs_id_sequence START WITH 1 INCREMENT BY 1;

CREATE TABLE journals (
  _id         BIGINT        PRIMARY KEY,
  id          VARCHAR(12)   UNIQUE NOT NULL,
  timestamp   TIMESTAMP     NOT NULL,
  content     BINARY        NOT NULL,
  -- TODO: Make `owner` a UUID column
  owner       VARCHAR(60)   NOT NULL,
  owner_type  VARCHAR(50)   NOT NULL,
  _version    INT           NOT NULL,
);

CREATE TABLE entries (
  _id         BIGINT        PRIMARY KEY,
  id          VARCHAR(12)   UNIQUE NOT NULL,
  timestamp   TIMESTAMP     NOT NULL,
  content     BINARY        NOT NULL,
  owner       VARCHAR(60)   NOT NULL,
  owner_type  VARCHAR(50)   NOT NULL,
  journal_id  BIGINT        NOT NULL,
  _version    INT           NOT NULL,
  FOREIGN KEY (journal_id) REFERENCES journals (_id),
);

CREATE TABLE etches (
  _id         BIGINT        PRIMARY KEY,
  id          VARCHAR(12)   UNIQUE NOT NULL,
  timestamp   TIMESTAMP     NOT NULL,
  content     BINARY        NOT NULL,
  owner       VARCHAR(60)   NOT NULL,
  owner_type  VARCHAR(50)   NOT NULL,
  entry_id    BIGINT        NOT NULL,
  _version    INT           NOT NULL,
  FOREIGN KEY (entry_id) REFERENCES entries (_id)
);

CREATE TABLE keypairs (
  _id         BIGINT        PRIMARY KEY,
  id          VARCHAR(12)   UNIQUE NOT NULL,
  timestamp   TIMESTAMP     NOT NULL,
  public_key  BINARY        NOT NULL,
  private_key BINARY        NOT NULL,
  owner       VARCHAR(60)   NOT NULL,
  owner_type  VARCHAR(50)   NOT NULL,
  _version    INT           NOT NULL,
);
