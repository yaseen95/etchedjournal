
CREATE TABLE journals (
  id          UUID          DEFAULT RANDOM_UUID() PRIMARY KEY,
  timestamp   TIMESTAMP     NOT NULL,
  content     BINARY        NOT NULL,
  -- TODO: Make `owner` a UUID column
  owner       VARCHAR(60)   NOT NULL,
  owner_type  VARCHAR(50)   NOT NULL,
  default     BOOLEAN       NOT NULL,
);

CREATE TABLE entries (
  id          UUID          DEFAULT RANDOM_UUID() PRIMARY KEY,
  timestamp   TIMESTAMP     NOT NULL,
  content     BINARY        NOT NULL,
  owner       VARCHAR(60)   NOT NULL,
  owner_type  VARCHAR(50)   NOT NULL,
  journal_id  UUID          NOT NULL,
  FOREIGN KEY (journal_id) REFERENCES journals (id),
);

CREATE TABLE etches (
  id          UUID          DEFAULT RANDOM_UUID() PRIMARY KEY,
  timestamp   TIMESTAMP     NOT NULL,
  content     BINARY        NOT NULL,
  owner       VARCHAR(60)   NOT NULL,
  owner_type  VARCHAR(50)   NOT NULL,
  entry_id    UUID          NOT NULL,
  FOREIGN KEY (entry_id) REFERENCES entries (id)
);

CREATE TABLE keypairs (
  id          UUID          DEFAULT RANDOM_UUID() PRIMARY KEY,
  timestamp   TIMESTAMP     NOT NULL,
  public_key  BINARY        NOT NULL,
  private_key BINARY        NOT NULL,
  owner       VARCHAR(60)   NOT NULL,
  owner_type  VARCHAR(50)   NOT NULL,
);
