package com.etchedjournal.etched.security

import com.auth0.jwt.interfaces.DecodedJWT
import com.etchedjournal.etched.security.jwt.JwtException

open class CognitoAuthenticationMapper {

    open fun mapToAuthentication(jwt: DecodedJWT): CognitoAuthentication {
        // TODO: Use preferred username
        val preferredUsername = jwt.getClaim(PREFERRED_USERNAME)

        val username = jwt.getClaim(USERNAME)
        val subject = jwt.subject
        if (username.isNull || subject == null) {
            throw JwtException("Invalid jwt")
        }

        return CognitoAuthentication(
            preferredUsername = "",
            username = username.asString(),
            sub = jwt.subject
        )
    }

    companion object {
        const val PREFERRED_USERNAME = "preferred_username"
        const val USERNAME = "username"
    }
}
