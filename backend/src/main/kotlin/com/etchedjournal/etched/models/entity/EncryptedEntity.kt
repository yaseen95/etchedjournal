package com.etchedjournal.etched.models.entity

import com.etchedjournal.etched.models.OwnerType
import com.fasterxml.jackson.annotation.JsonIgnore
import java.time.Instant
import javax.persistence.Column
import javax.persistence.JoinColumn
import javax.persistence.ManyToOne
import javax.persistence.MappedSuperclass

@MappedSuperclass
abstract class EncryptedEntity(
    id: String,
    timestamp: Instant,
    owner: String,
    ownerType: OwnerType,

    @Column(nullable = false)
    val content: ByteArray,

    @ManyToOne
    @JoinColumn(name = "key_pair_id")
    @JsonIgnore
    val keyPair: KeypairEntity
) : BaseEntity(
    id = id,
    timestamp = timestamp,
    owner = owner,
    ownerType = ownerType
)
