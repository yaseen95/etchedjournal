package com.etchedjournal.etched.models.entity

import com.etchedjournal.etched.models.OwnerType
import java.time.Instant
import java.util.UUID
import javax.persistence.Column
import javax.persistence.EnumType
import javax.persistence.Enumerated
import javax.persistence.GeneratedValue
import javax.persistence.GenerationType
import javax.persistence.Id
import javax.persistence.MappedSuperclass

@MappedSuperclass
abstract class EncryptedEntity(
    /**
     * This is only null when creating an entry. When retrieved by the database safe to
     * assume non-null
     */
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", unique = true, nullable = false, updatable = false)
    var id: UUID? = null,

    @Column(nullable = false)
    val timestamp: Instant = Instant.now(),

    @Column(nullable = false)
    val content: ByteArray,

    @Column(nullable = false)
    val owner: String,

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    val ownerType: OwnerType
)
