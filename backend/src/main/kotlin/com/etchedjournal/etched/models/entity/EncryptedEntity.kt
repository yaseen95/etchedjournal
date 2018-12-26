package com.etchedjournal.etched.models.entity

import com.etchedjournal.etched.models.OwnerType
import java.time.Instant
import javax.persistence.Column
import javax.persistence.MappedSuperclass

@MappedSuperclass
abstract class EncryptedEntity(
    id: String,
    timestamp: Instant,
    owner: String,
    ownerType: OwnerType,

    @Column(nullable = false)
    val content: ByteArray,

    // Should we reference using the user visible id or the database id?
    @Column(nullable = false, name = "key_pair_id")
    val keyPairId: String
) : BaseEntity(
    id = id,
    timestamp = timestamp,
    owner = owner,
    ownerType = ownerType
)
