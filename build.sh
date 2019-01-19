#!/usr/bin/env bash

export ETCHED_FLAVOR=dev

./gradlew nodeSetup && \
    ./gradlew frontend-ng:install && \
    ./gradlew frontend-ng:lint && \
    ./gradlew clean build
