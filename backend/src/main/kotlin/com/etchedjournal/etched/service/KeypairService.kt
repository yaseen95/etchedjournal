package com.etchedjournal.etched.service

import com.etchedjournal.etched.dto.CreateKeypairRequest
import com.etchedjournal.etched.models.jooq.generated.tables.pojos.KeyPair
import com.etchedjournal.etched.repository.Transaction

interface KeypairService {

    /**
     * Creates a brand new keypair
     *
     * @return the created keypair
     */
    fun createKeypair(txn: Transaction, req: CreateKeypairRequest): KeyPair

    /**
     * Get all keypairs for the given user
     */
    fun getUserKeypairs(txn: Transaction): List<KeyPair>

    /**
     * Get the specified keypair
     *
     * @param id the id of the keypair
     * @return the keypair with id [id]
     */
    fun getKeypair(txn: Transaction, id: String): KeyPair
}
