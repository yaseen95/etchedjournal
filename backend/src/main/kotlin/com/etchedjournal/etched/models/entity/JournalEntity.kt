package com.etchedjournal.etched.models.entity

import com.etchedjournal.etched.models.OwnerType
import java.time.Instant
import javax.persistence.Entity
import javax.persistence.Inheritance
import javax.persistence.InheritanceType
import javax.persistence.Table

@Entity
@Table(name = "journals")
@Inheritance(strategy = InheritanceType.TABLE_PER_CLASS)
class JournalEntity(
    id: String,
    content: ByteArray,
    owner: String,
    ownerType: OwnerType,
    timestamp: Instant,
    keyPairId: String
) : EncryptedEntity(
    id = id,
    content = content,
    owner = owner,
    ownerType = ownerType,
    timestamp = timestamp,
    keyPairId = keyPairId
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
