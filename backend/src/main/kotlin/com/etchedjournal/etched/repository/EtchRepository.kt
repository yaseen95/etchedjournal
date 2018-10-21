package com.etchedjournal.etched.repository

import com.etchedjournal.etched.models.entity.EtchEntity
import org.springframework.data.repository.CrudRepository
import java.util.UUID

interface EtchRepository : CrudRepository<EtchEntity, UUID> {
    fun findByEntryId(entryId: UUID): List<EtchEntity>
}
