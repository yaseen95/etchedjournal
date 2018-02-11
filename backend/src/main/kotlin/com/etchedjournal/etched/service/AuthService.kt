package com.etchedjournal.etched.service

import com.etchedjournal.etched.entity.EtchedUser

interface AuthService {

    /**
     * Retrieves the current user.
     */
    fun getRequestingUser(): EtchedUser

    fun register(username: String, password: String, email: String): EtchedUser

    fun authenticate(username: String, password: String): Unit
}
