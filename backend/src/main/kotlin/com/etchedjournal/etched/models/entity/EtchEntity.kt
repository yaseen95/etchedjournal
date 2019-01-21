package com.etchedjournal.etched.models.entity

import com.etchedjournal.etched.models.OwnerType
import com.fasterxml.jackson.annotation.JsonIgnore
import java.time.Instant
import javax.persistence.Entity
import javax.persistence.Inheritance
import javax.persistence.InheritanceType
import javax.persistence.JoinColumn
import javax.persistence.ManyToOne
import javax.persistence.Table

@Entity
@Table(name = "etches")
@Inheritance(strategy = InheritanceType.TABLE_PER_CLASS)
class EtchEntity(
    id: String,
    timestamp: Instant,
    content: ByteArray,
    owner: String,
    ownerType: OwnerType,
    keyPairId: String,

    @ManyToOne
    @JoinColumn(name = "entry_id")
    @JsonIgnore
    var entry: EntryEntity?
) : EncryptedEntity(
    id = id,
    timestamp = timestamp,
    content = content,
    owner = owner,
    ownerType = ownerType,
    keyPairId = keyPairId
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
