#!/usr/bin/env bash

set -e

export ETCHED_FLAVOR=dev

ls -la /usr/bin
ls -la /usr/local/bin
/usr/bin/docker-compose up -d

# TODO: Check if generated jooq code is different to committed jooq code
./gradlew nodeSetup
./gradlew frontend-ng:install
./gradlew frontend-ng:lint
./gradlew frontend-ng:prettier
./gradlew backend:lintKotlin
./gradlew backend:flywayMigrate
./gradlew backend:generateEtchedJooqSchemaSource
./gradlew clean build

./scripts/check-generated-jooq.sh
