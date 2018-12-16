package com.etchedjournal.etched.repository

import com.etchedjournal.etched.models.entity.EntryEntity
import org.springframework.data.repository.CrudRepository
import java.util.UUID

interface EntryRepository : CrudRepository<EntryEntity, UUID> {
    fun findByOwner(owner: String): Iterable<EntryEntity>

    fun findByJournal_Id(journalId: UUID): List<EntryEntity>
}
