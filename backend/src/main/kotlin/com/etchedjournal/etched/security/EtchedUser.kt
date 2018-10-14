package com.etchedjournal.etched.security

class EtchedUser(
    val id: String,
    var username: String,
    var email: String?,
    var admin: Boolean = false,

    // These can be set after registration.
    // The fields below are all for deriving the Master Key.
    var algo: String? = null,
    var salt: String? = null,
    var keySize: Int? = null,
    var iterations: Long? = null
) {
    override fun toString(): String {
        return "EtchedUser(id='$id', username='$username', email=$email)"
    }
}
