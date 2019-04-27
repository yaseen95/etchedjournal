package com.etchedjournal.etched.dto

import java.util.Arrays

data class CreateKeyPairRequest(
    val publicKey: ByteArray,
    val privateKey: ByteArray,
    val salt: String,
    val iterations: Int
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is CreateKeyPairRequest) return false

        if (!publicKey.contentEquals(other.publicKey)) return false
        if (!privateKey.contentEquals(other.privateKey)) return false
        if (salt != other.salt) return false
        if (iterations != other.iterations) return false

        return true
    }

    override fun hashCode(): Int {
        var result = publicKey.contentHashCode()
        result = 31 * result + privateKey.contentHashCode()
        result = 31 * result + salt.hashCode()
        result = 31 * result + iterations
        return result
    }

    override fun toString(): String {
        // Overriding toString to prevent accidentally logging private key
        return "CreateKeyPairRequest(" +
            "publicKey=${Arrays.toString(publicKey)}, " +
            "salt='$salt', " +
            "iterations=$iterations)"
    }
}
