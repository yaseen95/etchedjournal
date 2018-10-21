package com.etchedjournal.etched.models.entity

import com.etchedjournal.etched.models.OwnerType
import java.time.Instant
import java.util.UUID
import javax.persistence.Entity
import javax.persistence.Inheritance
import javax.persistence.InheritanceType
import javax.persistence.Table

@Entity
@Table(name = "entries")
@Inheritance(strategy = InheritanceType.TABLE_PER_CLASS)
class EntryEntity(
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
)
