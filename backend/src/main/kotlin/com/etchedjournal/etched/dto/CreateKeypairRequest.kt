package com.etchedjournal.etched.dto

import java.util.Arrays

data class CreateKeypairRequest(
    val publicKey: ByteArray,
    val privateKey: ByteArray
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is CreateKeypairRequest) return false

        if (!publicKey.contentEquals(other.publicKey)) return false
        if (!privateKey.contentEquals(other.privateKey)) return false

        return true
    }

    override fun hashCode(): Int {
        var result = publicKey.contentHashCode()
        result = 31 * result + privateKey.contentHashCode()
        return result
    }

    override fun toString(): String {
        // Overriding toString to prevent accidentally logging private key
        return "CreateKeypairRequest(publicKey=${Arrays.toString(publicKey)})"
    }
}
