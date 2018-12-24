package com.etchedjournal.etched.service

import com.etchedjournal.etched.models.entity.EntryEntity

interface EntryService {

    fun getEntry(entryId: String): EntryEntity

    fun getEntries(journalId: String): List<EntryEntity>

    fun create(journalId: String, content: ByteArray): EntryEntity
}
