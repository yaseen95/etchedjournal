package com.etchedjournal.etched.models.jooq.converter;

import com.etchedjournal.etched.models.Schema;
import com.google.common.collect.ImmutableBiMap;
import org.jooq.Converter;

import java.util.Objects;

public class SchemaConverter implements Converter<Short, Schema> {

    private static final ImmutableBiMap<Short, Schema> MAP;

    static {
        ImmutableBiMap.Builder<Short, Schema> builder = ImmutableBiMap.builder();
        builder.put((short) 1, Schema.V1_0);
        MAP = builder.build();
    }

    @Override
    public Schema from(Short databaseObject) {
        Schema result = MAP.get(databaseObject);
        return Objects.requireNonNull(result);
    }

    @Override
    public Short to(Schema userObject) {
        Short result = MAP.inverse().get(userObject);
        return Objects.requireNonNull(result);
    }

    @Override
    public Class<Short> fromType() {
        return Short.class;
    }

    @Override
    public Class<Schema> toType() {
        return Schema.class;
    }
}
