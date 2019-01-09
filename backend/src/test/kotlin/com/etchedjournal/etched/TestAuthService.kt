package com.etchedjournal.etched

import com.etchedjournal.etched.security.CognitoAuthentication
import com.etchedjournal.etched.security.EtchedUser
import com.etchedjournal.etched.service.AuthService
import org.springframework.security.core.context.SecurityContextHolder

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

    companion object {
        val users: MutableMap<String, EtchedUser> = mutableMapOf(
            "tester" to EtchedUser(
                id = "01234567-89ab-cdef-0123-456789abcdef",
                username = "tester"
            )
        )

        const val TESTER_USER_ID = "01234567-89ab-cdef-0123-456789abcdef"
    }
}
