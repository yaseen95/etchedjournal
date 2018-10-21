package com.etchedjournal.etched.service

import com.etchedjournal.etched.models.entity.EntryEntity
import java.util.UUID

interface EntryService {

    fun getEntry(entryId: UUID): EntryEntity

    fun getEntries(): List<EntryEntity>

    fun create(title: String): EntryEntity
}
