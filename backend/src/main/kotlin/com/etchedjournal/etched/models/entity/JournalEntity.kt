package com.etchedjournal.etched.models.entity

import com.etchedjournal.etched.models.OwnerType
import java.time.Instant
import java.util.UUID
import javax.persistence.Entity
import javax.persistence.Table

@Entity
@Table(name = "journals")
class JournalEntity(
    id: UUID? = null,
    timestamp: Instant = Instant.now(),
    content: ByteArray,
    owner: String,
    ownerType: OwnerType
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
            ")"
    }
}
