#!/usr/bin/env bash

JOOQ_GENERATED_PATH="backend/src/main/java/com/etchedjournal/etched/models/jooq/generated"

# We just check if there's a difference in the files
if [[ $(git status --porcelain -u "$JOOQ_GENERATED_PATH" | wc -l) -gt 0 ]]; then
    echo "Generated jooq code differs to committed changes"
    git status --porcelain -u "$JOOQ_GENERATED_PATH"
    exit 1
else
    echo "Generated jooq code matches committed jooq code"
fi
