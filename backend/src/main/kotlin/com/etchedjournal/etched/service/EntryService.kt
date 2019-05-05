package com.etchedjournal.etched.service

import com.etchedjournal.etched.dto.EncryptedEntityRequest
import com.etchedjournal.etched.models.jooq.generated.tables.records.EntryRecord
import com.etchedjournal.etched.repository.Transaction
import com.etchedjournal.etched.service.dto.UpdateEntryReq

interface EntryService {

    fun getEntry(txn: Transaction, entryId: String): EntryRecord

    fun getEntries(txn: Transaction, journalId: String): List<EntryRecord>

    fun create(txn: Transaction, req: EncryptedEntityRequest, journalId: String): EntryRecord

    fun update(txn: Transaction, req: UpdateEntryReq): EntryRecord
}
