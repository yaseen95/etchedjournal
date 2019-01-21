package com.etchedjournal.etched.models.entity

import com.etchedjournal.etched.utils.id.IdSerializer
import javax.persistence.AttributeConverter
import javax.persistence.Converter

/**
 * Converts ids between database long representation to a user friendly string
 */
@Converter
class IdConverter : AttributeConverter<String, Long> {
    override fun convertToDatabaseColumn(attribute: String): Long {
        return IdSerializer.deserialize(attribute)
    }

    override fun convertToEntityAttribute(dbData: Long): String {
        return IdSerializer.serialize(dbData)
    }
}
