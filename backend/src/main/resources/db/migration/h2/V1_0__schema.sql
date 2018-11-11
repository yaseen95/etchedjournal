
CREATE TABLE entries (
  id          UUID          DEFAULT RANDOM_UUID() PRIMARY KEY,
  timestamp   TIMESTAMP     NOT NULL,
  content     BINARY        NOT NULL,
  owner       VARCHAR(60)   NOT NULL,
  owner_type  VARCHAR(50)   NOT NULl
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
