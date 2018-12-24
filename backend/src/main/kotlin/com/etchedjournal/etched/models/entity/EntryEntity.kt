package com.etchedjournal.etched.models.entity

import com.etchedjournal.etched.models.OwnerType
import com.fasterxml.jackson.annotation.JsonIgnore
import java.time.Instant
import javax.persistence.Entity
import javax.persistence.Inheritance
import javax.persistence.InheritanceType
import javax.persistence.JoinColumn
import javax.persistence.ManyToOne
import javax.persistence.SequenceGenerator
import javax.persistence.Table

@Entity
@Table(name = "entries")
@Inheritance(strategy = InheritanceType.TABLE_PER_CLASS)
@SequenceGenerator(
    name = "id_generator",
    sequenceName = "entries_id_sequence",
    initialValue = 1,
    allocationSize = 1
)
class EntryEntity(
    id: String,
    content: ByteArray,
    owner: String,
    ownerType: OwnerType,
    timestamp: Instant,

    @ManyToOne
    @JoinColumn(name = "journal_id")
    @JsonIgnore
    val journal: JournalEntity
) : EncryptedEntity(
    id = id,
    content = content,
    owner = owner,
    ownerType = ownerType,
    timestamp = timestamp
) {
    override fun toString(): String {
        return "EntryEntity(" +
            "id=$id," +
            "timestamp=$timestamp," +
            "owner='$owner'," +
            "ownerType=$ownerType," +
            "journalId=${journal.id}" +
            ")"
    }
}
