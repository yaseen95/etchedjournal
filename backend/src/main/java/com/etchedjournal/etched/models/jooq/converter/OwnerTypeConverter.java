package com.etchedjournal.etched.models.jooq.converter;

import com.etchedjournal.etched.models.OwnerType;
import org.jooq.Converter;

public class OwnerTypeConverter implements Converter<String, OwnerType> {
    @Override
    public OwnerType from(String databaseObject) {
        return OwnerType.Companion.fromDb(databaseObject);
    }

    @Override
    public String to(OwnerType userObject) {
        return userObject.getDbRepresentation();
    }

    @Override
    public Class<String> fromType() {
        return String.class;
    }

    @Override
    public Class<OwnerType> toType() {
        return OwnerType.class;
    }
}
