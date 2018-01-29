CREATE TABLE entries (
  entry_id      BIGINT    IDENTITY PRIMARY KEY,
  title         VARCHAR(100) NOT NULL,
  created       TIMESTAMP    NOT NULL,
  finished      TIMESTAMP DEFAULT NULL,
  state         INT          NOT NULL,
  encrypted_key VARCHAR(100) NOT NULL,
  init_vector   VARCHAR(100) NOT NULL
);

CREATE TABLE etches (
  etch_id   BIGINT IDENTITY PRIMARY KEY,
  timestamp TIMESTAMP    NOT NULL,
  position  INT          NOT NULL,
  content   VARCHAR(100) NOT NULL,
  entry_id  BIGINT       NOT NULL,
  FOREIGN KEY (entry_id) REFERENCES entries (entry_id)
);
