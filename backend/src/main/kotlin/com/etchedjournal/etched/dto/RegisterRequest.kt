package com.etchedjournal.etched.dto

/**
 * DTO sent by user when registering.
 */
data class RegisterRequest(val username: String, val password: String, val email: String?) {
    override fun toString(): String {
        return "RegisterRequest(username='$username', email='$email')"
    }
}
