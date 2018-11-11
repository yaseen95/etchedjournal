package com.etchedjournal.etched.repository

import com.etchedjournal.etched.models.entity.KeypairEntity
import org.springframework.data.repository.CrudRepository
import java.util.UUID

interface KeypairRepository : CrudRepository<KeypairEntity, UUID> {
    fun findByOwner(owner: String): List<KeypairEntity>
}
