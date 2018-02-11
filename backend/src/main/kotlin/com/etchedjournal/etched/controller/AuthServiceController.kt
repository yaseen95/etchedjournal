package com.etchedjournal.etched.controller

import com.etchedjournal.etched.EtchedApplication
import com.etchedjournal.etched.dto.AuthenticationRequest
import com.etchedjournal.etched.dto.JwtResponse
import com.etchedjournal.etched.dto.RegisterRequest
import com.etchedjournal.etched.repository.EtchedUserRepository
import com.etchedjournal.etched.security.JwtTokenUtils
import com.etchedjournal.etched.service.AuthService
import org.apache.commons.validator.routines.EmailValidator
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestMethod
import org.springframework.web.bind.annotation.RestController
import java.util.regex.Pattern

@RequestMapping("/api/v1/auth")
@RestController
class AuthServiceController {

    @Autowired
    private lateinit var jwtTokenUtils: JwtTokenUtils

    @Autowired
    private lateinit var etchedUserRepository: EtchedUserRepository

    @Autowired
    private lateinit var authService: AuthService

    companion object {
        // Username must start with a letter and can be followed by letters or numbers. Between 6-20
        // characters.
        private val usernamePattern = Pattern.compile("^[a-zA-Z][a-zA-Z0-9]{5,30}")
    }

    @RequestMapping("/authenticate", method = [RequestMethod.POST])
    fun authenticate(@RequestBody authRequest: AuthenticationRequest): JwtResponse {
        EtchedApplication.log.info("Attempting authentication for {}", authRequest.username)

        authService.authenticate(authRequest.username, authRequest.password)

        // User is guaranteed to exist in database otherwise auth would have failed.
        val user = etchedUserRepository.findByUsername(authRequest.username)!!
        EtchedApplication.log.info("{} logged in.", authRequest.username)
        return JwtResponse(jwtTokenUtils.generateToken(user))
    }

    @RequestMapping("/register", method = [RequestMethod.POST])
    fun register(@RequestBody registerRequest: RegisterRequest): JwtResponse {
        validateRegisterRequest(registerRequest)
        EtchedApplication.log.info("Received register request with: {}", registerRequest)
        val user = authService.register(registerRequest.username, registerRequest.password,
                registerRequest.email)
        EtchedApplication.log.info("{} successfully registered.", registerRequest.username)
        // TODO: Should we return a jwt on register or do we require another login?
        return JwtResponse(jwtTokenUtils.generateToken(user))
    }

    /**
     * Validates register request by checking email and username fields.
     */
    private fun validateRegisterRequest(registerRequest: RegisterRequest) {
        if (!EmailValidator.getInstance().isValid(registerRequest.email)) {
            throw Exception("Invalid email address.")
        }

        if (etchedUserRepository.existsByUsername(registerRequest.username)) {
            throw Exception("Username already exists.")
        }

        if (etchedUserRepository.existsByEmail(registerRequest.email)) {
            throw Exception("Email already exists.")
        }

        if (!usernamePattern.matcher(registerRequest.username).matches()) {
            throw Exception("Username is invalid. Must start with letters and be between 6 and " +
                    "30 characters.")
        }
    }
}
