#!/usr/bin/env bash

set -eou pipefail

export ETCHED_FLAVOR=dev

# Disable docker-compose in CI
if [[ -z "${CI-}" && -z "${CIRCLECI-}" ]]; then
  DB_PASSWORD=dolphins docker-compose up -d
fi

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
