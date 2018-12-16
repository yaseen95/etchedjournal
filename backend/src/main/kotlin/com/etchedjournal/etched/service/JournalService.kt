package com.etchedjournal.etched.service

import com.etchedjournal.etched.models.entity.JournalEntity
import java.util.UUID

interface JournalService {

    fun getJournal(id: UUID): JournalEntity

    fun getJournals(): List<JournalEntity>

    fun create(content: ByteArray): JournalEntity

    fun exists(id: UUID): Boolean
}
