package com.etchedjournal.etched.dto

import java.util.Arrays

data class EncryptedEntityRequest(val content: ByteArray) {

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is EncryptedEntityRequest) return false

        if (!Arrays.equals(content, other.content)) return false

        return true
    }

    override fun hashCode(): Int {
        return Arrays.hashCode(content)
    }
}
