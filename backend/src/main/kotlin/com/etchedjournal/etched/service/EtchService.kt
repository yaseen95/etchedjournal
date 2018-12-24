package com.etchedjournal.etched.service

import com.etchedjournal.etched.dto.EncryptedEntityRequest
import com.etchedjournal.etched.models.entity.EtchEntity

interface EtchService {
    fun getEtches(entryId: String): List<EtchEntity>

    fun getEtch(etchId: String): EtchEntity

    fun create(entryId: String, etches: List<EncryptedEntityRequest>): List<EtchEntity>
}
