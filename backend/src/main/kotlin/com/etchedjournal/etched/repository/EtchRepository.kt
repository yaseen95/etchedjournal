package com.etchedjournal.etched.repository

import com.etchedjournal.etched.models.entity.EtchEntity
import org.springframework.data.repository.CrudRepository

interface EtchRepository : CrudRepository<EtchEntity, Long> {
    fun findByEntryId(entryId: String): List<EtchEntity>

    fun findById(id: String): EtchEntity?
}
