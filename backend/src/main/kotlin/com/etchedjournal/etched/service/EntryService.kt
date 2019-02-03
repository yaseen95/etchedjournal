package com.etchedjournal.etched.service

import com.etchedjournal.etched.dto.EncryptedEntityRequest
import com.etchedjournal.etched.models.jooq.generated.tables.pojos.Entry

interface EntryService {

    fun getEntry(entryId: String): Entry

    fun getEntries(journalId: String): List<Entry>

    fun create(req: EncryptedEntityRequest, journalId: String): Entry
}
