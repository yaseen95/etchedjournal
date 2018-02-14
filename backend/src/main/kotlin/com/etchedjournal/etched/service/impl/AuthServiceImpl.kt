package com.etchedjournal.etched.service.impl

import com.etchedjournal.etched.entity.EtchedUser
import com.etchedjournal.etched.repository.EtchedUserRepository
import com.etchedjournal.etched.security.SecurityUser
import com.etchedjournal.etched.service.AuthService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.AuthenticationException
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.stereotype.Service

@Service
class AuthServiceImpl : AuthService {

    @Autowired
    private lateinit var etchedUserRepository: EtchedUserRepository

    @Autowired
    private lateinit var bCryptPasswordEncoder: BCryptPasswordEncoder

    @Autowired
    private lateinit var authenticationManager: AuthenticationManager

    override fun getRequestingUser(): EtchedUser {
        val securityUser: SecurityUser
        try {
            securityUser = SecurityContextHolder.getContext().authentication.principal as
                    SecurityUser
        } catch (e: NullPointerException) {
            throw Exception("Not logged in.")
        } catch (e: ClassCastException) {
            throw Exception("Not logged in.")
        }

        return etchedUserRepository.findOne(securityUser.userId) ?: throw Exception(
                "User with id: ${securityUser.userId} is authenticated but not found in the " +
                        "database.")
    }

    override fun register(username: String, password: String, email: String): EtchedUser {
        // TODO: Handle usernames as case insensitive
        // I.e. usernames are still displayed with case sensitivity but are treated as case
        // insensitive.
        val hashedPassword = bCryptPasswordEncoder.encode(password)
        return etchedUserRepository.save(EtchedUser(null, username, hashedPassword, email))
    }

    override fun authenticate(username: String, password: String) {
        try {
            val authentication = authenticationManager.authenticate(
                    UsernamePasswordAuthenticationToken(username, password)
            )
            SecurityContextHolder.getContext().authentication = authentication
        } catch (ae: AuthenticationException) {
            throw Exception("Invalid credentials.")
        }
    }
}
