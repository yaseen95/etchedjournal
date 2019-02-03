package com.etchedjournal.etched.dto

import com.etchedjournal.etched.utils.id.IsEtchedId

data class EncryptedEntityRequest(
    val content: ByteArray,
    @IsEtchedId val keyPairId: String
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is EncryptedEntityRequest) return false

        if (!content.contentEquals(other.content)) return false
        if (keyPairId != other.keyPairId) return false

        return true
    }

    override fun hashCode(): Int {
        var result = content.contentHashCode()
        result = 31 * result + keyPairId.hashCode()
        return result
    }

    override fun toString(): String {
        return "EncryptedEntityRequest(keyPairId='$keyPairId')"
    }
}
