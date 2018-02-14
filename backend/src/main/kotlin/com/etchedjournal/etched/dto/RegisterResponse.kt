package com.etchedjournal.etched.dto


// TODO: Should these dtos all be moved inside the controller package?

data class RegisterResponse(
        var id: Long? = null,
        var username: String? = null,
        var email: String? = null,
        var admin: Boolean? = null,
        var algo: String? = null,
        var salt: String? = null,
        var keySize: Int? = null,
        var iterations: Long? = null,
        var token: String? = null
)
