package com.etchedjournal.etched.repository

import com.etchedjournal.etched.models.entity.KeypairEntity
import org.springframework.data.repository.CrudRepository

interface KeypairRepository : CrudRepository<KeypairEntity, Long> {
    fun findByOwner(owner: String): List<KeypairEntity>

    fun findById(id: String): KeypairEntity?
}
