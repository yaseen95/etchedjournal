package com.etchedjournal.etched.controller

import com.etchedjournal.etched.security.EtchedUser
import com.etchedjournal.etched.service.AuthService
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RequestMapping("/api/v1/auth")
@RestController
class AuthServiceController(private val authService: AuthService) {

    companion object {
        val logger: Logger = LoggerFactory.getLogger(AuthServiceController::class.java)
    }

    @GetMapping("/self")
    fun self(): EtchedUser {
        return authService.getUser()
    }
}
