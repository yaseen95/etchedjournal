package com.etchedjournal.etched.service

import com.etchedjournal.etched.models.entity.EtchEntity
import java.util.UUID

interface EtchService {
    fun getEtches(entryId: UUID): List<EtchEntity>

    fun getEtch(entryId: UUID, etchId: UUID): EtchEntity

    fun create(entryId: UUID, etches: List<EtchEntity>): List<EtchEntity>
}
