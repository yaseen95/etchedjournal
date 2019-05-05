package com.etchedjournal.etched.service

import com.etchedjournal.etched.dto.EncryptedEntityRequest
import com.etchedjournal.etched.models.jooq.generated.tables.records.JournalRecord
import com.etchedjournal.etched.repository.Transaction
import com.etchedjournal.etched.service.dto.UpdateJournalReq

interface JournalService {

    fun getJournal(txn: Transaction, id: String): JournalRecord

    fun getJournals(txn: Transaction): List<JournalRecord>

    fun create(txn: Transaction, req: EncryptedEntityRequest): JournalRecord

    fun exists(txn: Transaction, id: String): Boolean

    fun update(txn: Transaction, req: UpdateJournalReq): JournalRecord
}
