package com.etchedjournal.etched.models.jooq.converter;

import org.jooq.Converter;

import java.sql.Timestamp;
import java.time.Instant;

public class InstantConverter implements Converter<Timestamp, Instant> {
    @Override
    public Instant from(Timestamp databaseObject) {
        return Instant.ofEpochMilli(databaseObject.getTime());
    }

    @Override
    public Timestamp to(Instant userObject) {
        return new Timestamp(userObject.toEpochMilli());
    }

    @Override
    public Class<Timestamp> fromType() {
        return Timestamp.class;
    }

    @Override
    public Class<Instant> toType() {
        return Instant.class;
    }
}
