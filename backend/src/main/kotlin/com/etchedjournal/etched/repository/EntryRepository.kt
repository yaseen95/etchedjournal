package com.etchedjournal.etched.repository

import com.etchedjournal.etched.models.entity.EntryEntity
import org.springframework.data.repository.CrudRepository

interface EntryRepository : CrudRepository<EntryEntity, Long> {
    fun findByOwner(owner: String): Iterable<EntryEntity>

    fun findById(id: String): EntryEntity?

    fun findByJournal_Id(journalId: String): List<EntryEntity>
}
