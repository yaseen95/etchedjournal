package com.etchedjournal.etched.repository

import com.etchedjournal.etched.models.entity.JournalEntity
import org.springframework.data.repository.CrudRepository
import java.util.UUID

interface JournalRepository: CrudRepository<JournalEntity, UUID> {
    fun findByOwner(owner: String): Iterable<JournalEntity>

    fun existsByIdAndOwner(id: UUID, owner: String): Boolean
}
