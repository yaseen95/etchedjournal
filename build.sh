#!/usr/bin/env bash

./gradlew nodeSetup && \
    ./gradlew frontend-ng:install && \
    ./gradlew frontend-ng:lint && \
    ./gradlew clean build
