# Etched Journal (In Development)
A journal where entries are "etched" in stone. That's the idea anyway.

[![CircleCI](https://circleci.com/gh/yaseenkadir/etchedjournal.svg?style=svg)](https://circleci.com/gh/yaseenkadir/etchedjournal)

A few years ago I started journaling and I set a rule where I would try my best not to press
backspace. It feels like a cool enough idea to implement.

## Key Features
* All journal entries are encrypted on the client side
* After {x} seconds, entries cannot be edited

## Encryption
User content is encrypted using PGP keys. The PGP keys are generated client side and are stored 
encrypted by a *(strong)* user passphrase. All content is signed with the private key.

## Running
### DB Setup
```
docker-compose up

./gradlew backend:flywayMigrate
./gradlew backend:generateEtchedJooqSchemaSource
```

### Building
Building for the first time can be done by running `build.sh`.

Subsequent builds can be run with
```bash
./gradlew clean build
```

## Postman
Postman config files are also stored in `config/postman/`. It makes it easy to test and verify API
functionality.

Because auth is required for most requests, be sure to first login. Copy the `access_token` value, 
select edit on the `etched` collection on the left side, select the `Variables` tab and paste the
value.

All requests should now work correctly.
