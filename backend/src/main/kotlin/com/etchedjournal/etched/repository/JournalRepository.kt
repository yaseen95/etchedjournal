package com.etchedjournal.etched.repository

import com.etchedjournal.etched.models.entity.JournalEntity
import org.springframework.data.repository.CrudRepository

interface JournalRepository: CrudRepository<JournalEntity, Long> {
    fun findByOwner(owner: String): Iterable<JournalEntity>

    fun findById(id: String): JournalEntity?

    fun existsByIdAndOwner(id: String, owner: String): Boolean
}
