package com.etchedjournal.etched.service

import com.etchedjournal.etched.dto.EncryptedEntityRequest
import com.etchedjournal.etched.models.jooq.generated.tables.pojos.Journal
import com.etchedjournal.etched.repository.Transaction

interface JournalService {

    fun getJournal(txn: Transaction, id: String): Journal

    fun getJournals(txn: Transaction): List<Journal>

    fun create(txn: Transaction, req: EncryptedEntityRequest): Journal

    fun exists(txn: Transaction, id: String): Boolean
}
