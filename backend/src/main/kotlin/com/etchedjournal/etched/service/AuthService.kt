package com.etchedjournal.etched.service

import com.etchedjournal.etched.security.CognitoAuthentication
import com.etchedjournal.etched.security.EtchedUser

interface AuthService {

    /**
     * Returns id of current user
     */
    fun getUserId(): String

    fun getUser(): EtchedUser

    fun getPrincipal(): CognitoAuthentication

    fun fetchUserDetails(): Any
}
