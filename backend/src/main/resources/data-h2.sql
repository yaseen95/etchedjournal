--
-- val hashed = bCryptPasswordEncoder.encode("password")
--             var user = EtchedUser(null, "testuser", hashed, "test@example.com")
--             user = etchedUserRepository.save(user)
--             entryRepository.save(Entry("Journal title", user))

INSERT INTO users (user_id, username, password, email, admin)
VALUES (
  1,
  'testuser',
  '$2a$10$nZ4rwkQfzd51jBmorrZDceaJq2BJ2LI9Ap58VuoHNeTBDPHCLxvba', /* password is "password" */
  'testuser@example.com',
  FALSE
);

INSERT INTO entries (entry_id, title, created, finished, state, user_id)
VALUES (
  1,
  'Journal Title',
  parsedatetime('2018-02-14 10:47:53', 'yyyy-MM-dd hh:mm:ss'),
  NULL,
  'CREATED',
  1
);
