package com.etchedjournal.etched.models.entity

import com.etchedjournal.etched.models.OwnerType
import java.time.Instant
import java.util.UUID
import javax.persistence.Column
import javax.persistence.Entity
import javax.persistence.Table

@Entity
@Table(name = "journals")
class JournalEntity(
    id: UUID? = null,
    timestamp: Instant = Instant.now(),
    content: ByteArray,
    owner: String,
    ownerType: OwnerType,

    @Column(nullable = false)
    val default: Boolean = false
) : EncryptedEntity(
    id = id,
    timestamp = timestamp,
    content = content,
    owner = owner,
    ownerType = ownerType
) {
    override fun toString(): String {
        return "JournalEntity(" +
            "id=$id," +
            "timestamp=$timestamp," +
            "owner='$owner'," +
            "ownerType=$ownerType," +
            "default=$default" +
            ")"
    }

    companion object {
        /**
         * Creates the default journal for [owner]
         */
        fun createDefault(owner: String): JournalEntity = JournalEntity(
            content = byteArrayOf(),
            owner = owner,
            ownerType = OwnerType.USER,
            default = true
        )
    }
}
