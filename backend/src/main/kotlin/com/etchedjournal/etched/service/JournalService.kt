package com.etchedjournal.etched.service

import com.etchedjournal.etched.dto.EncryptedEntityRequest
import com.etchedjournal.etched.models.jooq.generated.tables.pojos.Journal

interface JournalService {

    fun getJournal(id: String): Journal

    fun getJournals(): List<Journal>

    fun create(req: EncryptedEntityRequest): Journal

    fun exists(id: String): Boolean
}
