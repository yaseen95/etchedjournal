package com.etchedjournal.etched.dto

/**
 * DTO sent by user when authenticating.
 */
data class AuthenticationRequest(val username: String, val password: String) {
    override fun toString(): String {
        return "AuthenticationRequest(username='$username')"
    }
}
