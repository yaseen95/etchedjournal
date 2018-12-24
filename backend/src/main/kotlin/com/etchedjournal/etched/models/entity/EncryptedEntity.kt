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
    val content: ByteArray

    // TODO: Should we store the key id used to encrypt this entity?
    // I think we should
    // 1. Users can gradually rotate keys whilst also being able to decrypt older entries/etches
    // 2. We can add some extra verification when a user deletes an etch/entry. We'd be able to
    //    set up a "challenge" were we verify that they are holding the private key by sending a
    //    nonce encrypted by the public key. If they can tell us what the nonce is, they've proven
    //    ownership of the key

) : BaseEntity(
    id = id,
    timestamp = timestamp,
    owner = owner,
    ownerType = ownerType
)
