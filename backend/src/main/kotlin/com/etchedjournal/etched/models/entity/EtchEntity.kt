package com.etchedjournal.etched.models.entity

import com.etchedjournal.etched.models.OwnerType
import com.fasterxml.jackson.annotation.JsonIgnore
import java.time.Instant
import java.util.UUID
import javax.persistence.Entity
import javax.persistence.JoinColumn
import javax.persistence.ManyToOne
import javax.persistence.Table

@Entity
@Table(name = "etches")
class EtchEntity(
    id: UUID? = null,
    timestamp: Instant = Instant.now(),
    content: ByteArray,
    owner: String,
    ownerType: OwnerType,

    @ManyToOne
    @JoinColumn(name = "entry_id")
    @JsonIgnore
    var entry: EntryEntity?
) : EncryptedEntity(
    id = id,
    timestamp = timestamp,
    content = content,
    owner = owner,
    ownerType = ownerType
) {
    override fun toString(): String {
        return "EtchEntity(" +
            "id=$id," +
            "timestamp=$timestamp," +
            "owner='$owner'," +
            "ownerType=$ownerType," +
            "entryId=${entry?.id}" +
            ")"
    }
}
