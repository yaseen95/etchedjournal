package com.etchedjournal.etched.models.entity

import com.etchedjournal.etched.models.OwnerType
import java.time.Instant
import javax.persistence.Column
import javax.persistence.Entity
import javax.persistence.SequenceGenerator
import javax.persistence.Table

@Entity
@Table(name = "keypairs")
@SequenceGenerator(
    name = "id_generator",
    sequenceName = "key_pairs_id_sequence",
    initialValue = 1,
    allocationSize = 1
)
class KeypairEntity(
    id: String,
    timestamp: Instant,
    owner: String,
    ownerType: OwnerType,

    @Column(name = "public_key", unique = true, nullable = false)
    val publicKey: ByteArray,

    @Column(name = "private_key", unique = true, nullable = false)
    val privateKey: ByteArray

    // TODO: Should we store expiration, date created, etc?
) : BaseEntity(
    id = id,
    timestamp = timestamp,
    owner = owner,
    ownerType = ownerType
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is KeypairEntity) return false

        if (_id != other._id) return false
        if (id != other.id) return false
        if (timestamp != other.timestamp) return false
        if (!publicKey.contentEquals(other.publicKey)) return false
        if (!privateKey.contentEquals(other.privateKey)) return false
        if (owner != other.owner) return false
        if (ownerType != other.ownerType) return false
        if (_version != other._version) return false

        return true
    }

    override fun hashCode(): Int {
        var result = _id?.hashCode() ?: 0
        result = 31 * result + id.hashCode()
        result = 31 * result + timestamp.hashCode()
        result = 31 * result + publicKey.contentHashCode()
        result = 31 * result + privateKey.contentHashCode()
        result = 31 * result + owner.hashCode()
        result = 31 * result + ownerType.hashCode()
        result = 31 * result + (_version ?: 0)
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
