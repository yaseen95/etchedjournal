package com.etchedjournal.etched.service

import com.etchedjournal.etched.entity.EtchedUser

interface UserService {

    /**
     * Configures the encryption properties for the specified user.
     */
    fun configureEncryptionProperties(
            user: EtchedUser,
            algo: String,
            salt: String,
            iterations: Long,
            keySize: Int): EtchedUser
}
