package com.etchedjournal.etched

import com.etchedjournal.etched.security.CognitoAuthentication
import com.etchedjournal.etched.security.EtchedUser
import com.etchedjournal.etched.service.AuthService
import org.springframework.security.core.Authentication
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.core.context.SecurityContextImpl
import java.util.UUID

class TestAuthService : AuthService {

    override fun getUserId(): String {
        return getPrincipal().sub
    }

    override fun getUser(): EtchedUser {
        return users[getPrincipal().username]!!
    }

    override fun getPrincipal(): CognitoAuthentication {
        val auth = SecurityContextHolder.getContext().authentication
        val username = auth.name
        val user = users[username]!!
        return CognitoAuthentication(
            sub = user.id,
            username = user.username,
            preferredUsername = ""
        )
    }

    override fun fetchUserDetails(): Any {
        TODO()
    }

    /**
     * Sets the user with username as the current user
     */
    fun setCurrentUser(user: EtchedUser) {
        clearCurrentUser()
        require(users.containsKey(user.username))

        class SimpleAuth(private val username: String) : Authentication {
            override fun getName(): String = username
            override fun getAuthorities(): MutableCollection<out GrantedAuthority> = TODO()
            override fun setAuthenticated(isAuthenticated: Boolean) = TODO()
            override fun getCredentials(): Any = TODO()
            override fun getPrincipal(): Any = TODO()
            override fun isAuthenticated(): Boolean = TODO()
            override fun getDetails(): Any = TODO()
        }

        val auth = SimpleAuth(user.username)

        val securityCtx = SecurityContextImpl(auth)
        SecurityContextHolder.setContext(securityCtx)
    }

    fun clearCurrentUser() {
        SecurityContextHolder.clearContext()
    }

    companion object {
        const val TESTER_USER_ID = "01234567-89ab-cdef-0123-456789abcdef"
        val TESTER = EtchedUser(TESTER_USER_ID, "tester")
        val ALICE = EtchedUser(UUID(0, 0).toString(), "alice")

        val users: MutableMap<String, EtchedUser> = mutableMapOf(
            TESTER.username to TESTER,
            ALICE.username to ALICE
        )
    }
}
