package com.etchedjournal.etched.service

import com.etchedjournal.etched.dto.EncryptedEntityRequest
import com.etchedjournal.etched.models.jooq.generated.tables.pojos.Etch
import com.etchedjournal.etched.repository.Transaction

interface EtchService {
    fun getEtches(txn: Transaction, entryId: String): List<Etch>

    fun getEtch(txn: Transaction, etchId: String): Etch

    fun create(txn: Transaction, etches: List<EncryptedEntityRequest>, entryId: String): List<Etch>
}
