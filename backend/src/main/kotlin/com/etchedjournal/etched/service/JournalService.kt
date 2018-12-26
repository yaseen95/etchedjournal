package com.etchedjournal.etched.service

import com.etchedjournal.etched.dto.EncryptedEntityRequest
import com.etchedjournal.etched.models.entity.JournalEntity

interface JournalService {

    fun getJournal(id: String): JournalEntity

    fun getJournals(): List<JournalEntity>

    fun create(req: EncryptedEntityRequest): JournalEntity

    fun exists(id: String): Boolean
}
