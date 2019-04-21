package com.etchedjournal.etched.models.jooq.converter

import org.jooq.Converter
import java.sql.Timestamp
import java.time.Instant

class NullableInstantConverter : Converter<Timestamp, Instant> {

    override fun from(databaseObject: Timestamp?): Instant? {
        if (databaseObject == null) {
            return null
        }
        return Instant.ofEpochMilli(databaseObject.time)
    }

    override fun to(userObject: Instant?): Timestamp? {
        if (userObject == null) {
            return null
        }
        return Timestamp(userObject.toEpochMilli())
    }

    override fun fromType(): Class<Timestamp> {
        return Timestamp::class.java
    }

    override fun toType(): Class<Instant> {
        return Instant::class.java
    }
}
