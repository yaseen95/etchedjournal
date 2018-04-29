package com.etchedjournal.etched.controller

import com.etchedjournal.etched.dto.AuthenticationRequest
import com.etchedjournal.etched.dto.EncryptionPropertiesRequest
import com.etchedjournal.etched.dto.LoginResponse
import com.etchedjournal.etched.dto.RegisterRequest
import com.etchedjournal.etched.security.EtchedUser
import com.etchedjournal.etched.service.AuthService
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController


@RequestMapping("/api/v1/auth")
@RestController
class AuthServiceController(private val authService: AuthService) {

    companion object {
        val logger: Logger = LoggerFactory.getLogger(AuthServiceController::class.java)
    }

    @PostMapping("/authenticate")
    fun authenticate(@RequestBody authRequest: AuthenticationRequest): LoginResponse {
        return authService.authenticate(authRequest.username, authRequest.password)
    }

    @PostMapping("/register")
    fun register(@RequestBody registerRequest: RegisterRequest): EtchedUser {
        return authService.register(registerRequest.username, registerRequest.password,
                registerRequest.email)
    }

    @GetMapping("/self")
    fun self(): EtchedUser {
        return authService.getRequestingUser()
    }

    @PostMapping("/self/configure-encryption")
    fun configureEncryption(
            @RequestBody encryptionProperties: EncryptionPropertiesRequest
    ): EtchedUser {
        return authService.configureEncryptionProperties(
                encryptionProperties.algo,
                encryptionProperties.salt,
                encryptionProperties.iterations,
                encryptionProperties.keySize
        )
    }
}
