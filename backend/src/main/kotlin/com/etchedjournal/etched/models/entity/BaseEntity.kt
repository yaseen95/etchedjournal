package com.etchedjournal.etched.models.entity

import com.etchedjournal.etched.models.OwnerType
import com.fasterxml.jackson.annotation.JsonIgnore
import java.time.Instant
import javax.persistence.Column
import javax.persistence.EnumType
import javax.persistence.Enumerated
import javax.persistence.GeneratedValue
import javax.persistence.GenerationType
import javax.persistence.Id
import javax.persistence.MappedSuperclass
import javax.persistence.Version

@MappedSuperclass
abstract class BaseEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "id_generator")
    @Column(nullable = false, unique = true, updatable = false, insertable = true)
    @JsonIgnore
    var _id: Long? = null,

    @Column(unique = true, nullable = false, updatable = false, insertable = true)
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
