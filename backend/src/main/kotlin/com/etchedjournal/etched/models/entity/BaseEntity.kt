package com.etchedjournal.etched.models.entity

import com.etchedjournal.etched.models.OwnerType
import com.fasterxml.jackson.annotation.JsonIgnore
import java.time.Instant
import javax.persistence.Column
import javax.persistence.EnumType
import javax.persistence.Enumerated
import javax.persistence.Id
import javax.persistence.IdClass
import javax.persistence.MappedSuperclass
import javax.persistence.Version

@MappedSuperclass
// Used to get around restriction around converting id columns
@IdClass(EntityIdClass::class)
abstract class BaseEntity(
    @Id
    val id: String,

    /** Represents the created time of the entity */
    @Column(nullable = false, updatable = false)
    val timestamp: Instant,

    @Column(nullable = false)
    val owner: String,

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    val ownerType: OwnerType,

    @Version
    @Column(nullable = false)
    @JsonIgnore
    var _version: Int? = null
)
