package com.etchedjournal.etched.service.impl

import com.etchedjournal.etched.security.CognitoAuthentication
import com.etchedjournal.etched.security.EtchedUser
import com.etchedjournal.etched.service.AuthService
import org.slf4j.LoggerFactory
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service

@Service
class AuthServiceImpl : AuthService {
    override fun getUserId(): String {
        return getPrincipal().sub
    }

    override fun getUser(): EtchedUser {
        val p = getPrincipal()
        return EtchedUser(id = p.sub, username = p.username)
    }

    override fun fetchUserDetails(): Any {
        TODO("not implemented") //To change body of created functions use File | Settings | File Templates.
    }

    override fun getPrincipal(): CognitoAuthentication {
        val auth = SecurityContextHolder.getContext().authentication
            ?: throw IllegalStateException("Expected authentication to exist")
        return auth as CognitoAuthentication
    }

    companion object {
        private val logger = LoggerFactory.getLogger(AuthServiceImpl::class.java)
    }
}
