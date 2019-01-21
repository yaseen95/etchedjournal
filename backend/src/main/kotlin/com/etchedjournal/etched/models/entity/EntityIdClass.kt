package com.etchedjournal.etched.models.entity

import java.io.Serializable
import javax.persistence.Column
import javax.persistence.Convert

/**
 * Used to get around restriction around using @Convert with an @Id annotation
 *
 * https://stackoverflow.com/a/46148057
 * https://hibernate.atlassian.net/browse/HHH-10594
 */
class EntityIdClass : Serializable {
    @Column(unique = true, nullable = false, updatable = false, insertable = true)
    @Convert(converter = IdConverter::class)
    var id: String? = null

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is EntityIdClass) return false

        if (id != other.id) return false

        return true
    }

    override fun hashCode(): Int {
        return id?.hashCode() ?: 0
    }
}
