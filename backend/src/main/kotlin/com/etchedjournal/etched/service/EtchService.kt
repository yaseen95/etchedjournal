package com.etchedjournal.etched.service

import com.etchedjournal.etched.dto.EncryptedEntityRequest
import com.etchedjournal.etched.models.jooq.generated.tables.pojos.Etch

interface EtchService {
    fun getEtches(entryId: String): List<Etch>

    fun getEtch(etchId: String): Etch

    fun create(etches: List<EncryptedEntityRequest>, entryId: String): List<Etch>
}
