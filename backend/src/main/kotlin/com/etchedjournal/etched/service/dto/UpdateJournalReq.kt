package com.etchedjournal.etched.service.dto

import com.etchedjournal.etched.models.Schema

data class UpdateJournalReq(
    val journalId: String,
    val content: ByteArray,
    val keyPairId: String,
    val schema: Schema
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is UpdateJournalReq) return false

        if (journalId != other.journalId) return false
        if (!content.contentEquals(other.content)) return false
        if (keyPairId != other.keyPairId) return false
        if (schema != other.schema) return false

        return true
    }

    override fun hashCode(): Int {
        var result = journalId.hashCode()
        result = 31 * result + content.contentHashCode()
        result = 31 * result + keyPairId.hashCode()
        result = 31 * result + schema.hashCode()
        return result
    }
}
