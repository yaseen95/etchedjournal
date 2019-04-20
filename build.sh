#!/usr/bin/env bash

set -eou pipefail

export ETCHED_FLAVOR=dev
export DB_PASSWORD="dolphins"

# Disable docker-compose in CIRCLECI
if [[ -z "${CIRCLECI-}" ]]; then
  docker-compose up -d
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
