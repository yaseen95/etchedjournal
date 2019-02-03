package com.etchedjournal.etched.models.jooq.converter;

import com.etchedjournal.etched.utils.id.IdSerializer;
import org.jooq.Converter;

public class IdConverter implements Converter<Long, String> {

    @Override
    public String from(Long databaseObject) {
        return IdSerializer.INSTANCE.serialize(databaseObject);
    }

    @Override
    public Long to(String userObject) {
        return IdSerializer.INSTANCE.deserialize(userObject);
    }

    @Override
    public Class<Long> fromType() {
        return Long.class;
    }

    @Override
    public Class<String> toType() {
        return String.class;
    }
}
