package com.etchedjournal.etched.service

import com.etchedjournal.etched.dto.LoginResponse
import com.etchedjournal.etched.security.EtchedUser
import com.etchedjournal.etched.security.SimpleUser

interface AuthService {

    /**
     * Returns basic user details of requesting user
     */
    fun simpleUser(): SimpleUser

    /**
     * Return full user details of requesting user
     */
    fun requestingUser(): EtchedUser

    /**
     * Register a new user with the given attributes
     */
    fun register(username: String, password: String, email: String): EtchedUser

    /**
     * Authenticate a user
     */
    fun authenticate(username: String, password: String): LoginResponse

    /**
     * Configures the encryption properties for the user
     */
    fun configureEncryptionProperties(
            algo: String,
            salt: String,
            iterations: Long,
            keySize: Int
    ): EtchedUser
}
