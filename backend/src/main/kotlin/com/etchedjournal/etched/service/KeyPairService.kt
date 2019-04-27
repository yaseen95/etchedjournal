package com.etchedjournal.etched.service

import com.etchedjournal.etched.dto.CreateKeyPairRequest
import com.etchedjournal.etched.models.jooq.generated.tables.pojos.KeyPair
import com.etchedjournal.etched.repository.Transaction

interface KeyPairService {

    /**
     * Creates a brand new key pair
     *
     * @return the created key pair
     */
    fun createKeyPair(txn: Transaction, req: CreateKeyPairRequest): KeyPair

    /**
     * Get all key pairs for the given user
     */
    fun getUserKeyPairs(txn: Transaction): List<KeyPair>

    /**
     * Get the specified key pair
     *
     * @param id the id of the keyPair
     * @return the keyPair with id [id]
     */
    fun getKeyPair(txn: Transaction, id: String): KeyPair
}
