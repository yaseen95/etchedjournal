package com.etchedjournal.etched.service

import com.etchedjournal.etched.dto.EncryptedEntityRequest
import com.etchedjournal.etched.models.entity.EtchEntity
import java.util.UUID

interface EtchService {
    fun getEtches(entryId: UUID): List<EtchEntity>

    fun getEtch(etchId: UUID): EtchEntity

    fun create(entryId: UUID, etches: List<EncryptedEntityRequest>): List<EtchEntity>
}
