package com.etchedjournal.etched.service

import com.etchedjournal.etched.dto.EncryptedEntityRequest
import com.etchedjournal.etched.models.jooq.generated.tables.pojos.Entry
import com.etchedjournal.etched.repository.Transaction

interface EntryService {

    fun getEntry(txn: Transaction, entryId: String): Entry

    fun getEntries(txn: Transaction, journalId: String): List<Entry>

    fun create(txn: Transaction, req: EncryptedEntityRequest, journalId: String): Entry
}
