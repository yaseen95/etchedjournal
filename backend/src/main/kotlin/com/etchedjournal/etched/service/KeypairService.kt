package com.etchedjournal.etched.service

import com.etchedjournal.etched.dto.CreateKeypairRequest
import com.etchedjournal.etched.models.entity.KeypairEntity

interface KeypairService {

    /**
     * Creates a brand new keypair
     *
     * @return the created keypair
     */
    fun createKeypair(req: CreateKeypairRequest): KeypairEntity

    /**
     * Get all keypairs for the given user
     */
    fun getUserKeypairs(): List<KeypairEntity>

    /**
     * Get the specified keypair
     *
     * @param id the id of the keypair
     * @return the keypair with id [id]
     */
    fun getKeypair(id: String): KeypairEntity
}
