package com.etchedjournal.etched.service

import com.etchedjournal.etched.dto.TokenResponse
import com.etchedjournal.etched.security.EtchedUser

interface AuthService {

    /**
     * Returns id of current user
     */
    fun getUserId(): String

    /**
     * Returns id of current user or null if not logged in
     */
    fun getUserIdOrNull(): String?

    /**
     * Return full user details of requesting user
     */
    fun getRequestingUser(): EtchedUser

    /**
     * Register a new user with the given attributes
     */
    fun register(username: String, password: String, email: String): EtchedUser

    /**
     * Authenticate a user
     */
    fun authenticate(username: String, password: String): TokenResponse

    /**
     * Refreshes JWT tokens using the supplied refresh token
     */
    fun refreshToken(refreshToken: String): TokenResponse

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
