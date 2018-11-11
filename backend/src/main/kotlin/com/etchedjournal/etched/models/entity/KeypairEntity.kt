package com.etchedjournal.etched.models.entity

import com.etchedjournal.etched.models.OwnerType
import java.time.Instant
import java.util.UUID
import javax.persistence.Column
import javax.persistence.Entity
import javax.persistence.EnumType
import javax.persistence.Enumerated
import javax.persistence.GeneratedValue
import javax.persistence.GenerationType
import javax.persistence.Id
import javax.persistence.Table

@Entity
@Table(name = "keypairs")
data class KeypairEntity(
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

    @Column(name = "public_key", unique = true, nullable = false)
    val publicKey: ByteArray,

    @Column(name = "private_key", unique = true, nullable = false)
    val privateKey: ByteArray,

    // TODO: Should we store expiration, date created, etc?

    @Column(nullable = false)
    val owner: String,

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    val ownerType: OwnerType
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is KeypairEntity) return false

        if (id != other.id) return false
        if (timestamp != other.timestamp) return false
        if (!publicKey.contentEquals(other.publicKey)) return false
        if (!privateKey.contentEquals(other.privateKey)) return false
        if (owner != other.owner) return false
        if (ownerType != other.ownerType) return false

        return true
    }

    override fun hashCode(): Int {
        var result = id?.hashCode() ?: 0
        result = 31 * result + timestamp.hashCode()
        result = 31 * result + publicKey.contentHashCode()
        result = 31 * result + privateKey.contentHashCode()
        result = 31 * result + owner.hashCode()
        result = 31 * result + ownerType.hashCode()
        return result
    }

    override fun toString(): String {
        return "KeypairEntity(" +
            "id=$id, " +
            "timestamp=$timestamp, " +
            "owner='$owner', " +
            "ownerType=$ownerType" +
            ")"
    }
}
