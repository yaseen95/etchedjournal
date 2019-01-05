package com.etchedjournal.etched.security

import org.springframework.security.core.Authentication
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority

/**
 * Authentication of a user provided via Cognito
 *
 * @property sub the id of the user. UUID. Does not change. Entities should model their
 * relationship to a user using this id.
 * @property username the username of the user. Randomly generated on the client side. Does not
 * change. This **MUST NOT** be used to model entity relationships. This only exists solely because
 * Cognito requires it.
 * @property preferredUsername preferred username of the user. Can be changed. This is the
 * username that a user assigns themselves and signs in with e.g. samsepiol. This is the value
 * that the frontend interacts with. **MUST NOT** be used to model entity relationships.
 */
class CognitoAuthentication(
    val sub: String,
    val username: String,
    val preferredUsername: String
) : Authentication {

    override fun getName(): String {
        return sub
    }

    override fun getAuthorities(): Collection<out GrantedAuthority> {
        // There is only one authority/rule, USER
        return AUTHORITIES
    }

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is CognitoAuthentication) return false

        if (sub != other.sub) return false
        if (username != other.username) return false
        if (preferredUsername != other.preferredUsername) return false
        if (authorities != other.authorities) return false

        return true
    }

    override fun hashCode(): Int {
        var result = sub.hashCode()
        result = 31 * result + username.hashCode()
        result = 31 * result + preferredUsername.hashCode()
        result = 31 * result + authorities.hashCode()
        return result
    }

    // Everything below exists just to meet the interface requirements of Authentication
    override fun setAuthenticated(isAuthenticated: Boolean) {
        TODO("not implemented")
    }

    override fun getCredentials(): Any {
        TODO("not implemented")
    }

    override fun getPrincipal(): Any {
        return this
    }

    override fun isAuthenticated(): Boolean {
        return true
    }

    override fun getDetails(): Any? {
        return null
    }

    companion object {
        val AUTHORITIES = setOf(SimpleGrantedAuthority("ROLE_USER"))
    }
}
