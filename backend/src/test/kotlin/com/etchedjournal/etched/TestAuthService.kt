package com.etchedjournal.etched

import com.etchedjournal.etched.dto.TokenResponse
import com.etchedjournal.etched.security.EtchedUser
import com.etchedjournal.etched.service.AuthService
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.core.userdetails.User
import java.util.UUID

class TestAuthService : AuthService {

    companion object {
        val users: MutableMap<String, EtchedUser> = mutableMapOf(
            "tester" to EtchedUser(
                id = "01234567-89ab-cdef-0123-456789abcdef",
                username = "tester",
                email = "tester@example.com",
                salt = "salt",
                algo = "algo",
                keySize = 256,
                iterations = 100000
            )
        )

        val logger: Logger = LoggerFactory.getLogger(TestAuthService::class.java)

        const val TESTER_USER_ID = "01234567-89ab-cdef-0123-456789abcdef"
    }

    override fun getUserId(): String {
        return getRequestingUser().id
    }

    override fun getRequestingUser(): EtchedUser {
        val user = getUser()
        return users.getOrElse(user.username, { throw Exception() })
    }

    override fun getUserIdOrNull(): String? {
        return getRequestingUser().id
    }

    override fun register(username: String, password: String, email: String?): EtchedUser {
        if (username in users) {
            throw Exception("User with username and/or email already exists")
        }

        users[username] = EtchedUser(UUID.randomUUID().toString(), username, email)
        return users[username]!!
    }

    override fun authenticate(username: String, password: String): TokenResponse {
        TODO("not implemented") //To change body of created functions use File | Settings | File Templates.
    }

    override fun configureEncryptionProperties(algo: String, salt: String, iterations: Long, keySize: Int): EtchedUser {
        TODO("not implemented") //To change body of created functions use File | Settings | File Templates.
    }

    private fun getUser(): User {
        return SecurityContextHolder.getContext().authentication.principal as User
    }

    override fun refreshToken(refreshToken: String): TokenResponse {
        TODO("not implemented") //To change body of created functions use File | Settings | File Templates.
    }
}
