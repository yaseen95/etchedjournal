#!/usr/bin/env bash

export ETCHED_FLAVOR=dev

docker-compose up -d

# TODO: Check if generated jooq code is different to committed jooq code
./gradlew nodeSetup && \
    ./gradlew frontend-ng:install && \
    ./gradlew frontend-ng:lint && \
    ./gradlew backend:flywayMigrate && \
    ./gradlew backend:generateEtchedJooqSchemaSource && \
    ./gradlew clean build
