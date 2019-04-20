package com.etchedjournal.etched.dto

import com.etchedjournal.etched.models.Schema
import com.etchedjournal.etched.utils.id.IsEtchedId

data class EncryptedEntityRequest(
    val content: ByteArray,
    @field:IsEtchedId val keyPairId: String,
    val schema: Schema
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is EncryptedEntityRequest) return false

        if (!content.contentEquals(other.content)) return false
        if (keyPairId != other.keyPairId) return false
        if (schema != other.schema) return false

        return true
    }

    override fun hashCode(): Int {
        var result = content.contentHashCode()
        result = 31 * result + keyPairId.hashCode()
        result = 31 * result + schema.hashCode()
        return result
    }

    override fun toString(): String {
        return "EncryptedEntityRequest(keyPairId='$keyPairId', schema='$schema')"
    }
}
