package com.etchedjournal.etched.controller

import com.etchedjournal.etched.EtchedApplication
import com.etchedjournal.etched.api.AuthServiceApi
import com.etchedjournal.etched.dto.AuthenticationRequest
import com.etchedjournal.etched.dto.JwtResponse
import com.etchedjournal.etched.dto.RegisterRequest
import com.etchedjournal.etched.entity.EtchedUser
import com.etchedjournal.etched.repository.EtchedUserRepository
import com.etchedjournal.etched.security.JwtTokenUtils
import org.apache.commons.validator.routines.EmailValidator
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.AuthenticationException
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestMethod
import org.springframework.web.bind.annotation.RestController
import java.util.regex.Pattern

@RequestMapping("/api/v1/auth")
@RestController
class AuthenticationController : AuthServiceApi {

    @Autowired
    private lateinit var authenticationManager: AuthenticationManager

    @Autowired
    private lateinit var jwtTokenUtils: JwtTokenUtils

    @Autowired
    private lateinit var bCryptPasswordEncoder: BCryptPasswordEncoder

    @Autowired
    private lateinit var etchedUserRepository: EtchedUserRepository

    companion object {
        // Username must start with a letter and can be followed by letters or numbers. Between 6-20
        // characters.
        private val usernamePattern = Pattern.compile("^[a-zA-Z][a-zA-Z0-9]{5,30}")
    }

    @RequestMapping("/authenticate", method = [RequestMethod.POST])
    override fun authenticate(@RequestBody authRequest: AuthenticationRequest): JwtResponse {
        EtchedApplication.log.info("Attempting authentication for {}", authRequest.username)
        try {
            val authentication = authenticationManager.authenticate(
                    UsernamePasswordAuthenticationToken(authRequest.username, authRequest.password)
            )
            SecurityContextHolder.getContext().authentication = authentication
        } catch (ae: AuthenticationException) {
            throw Exception("Invalid credentials.")
        }

        // User is guaranteed to exist in database otherwise auth would have failed.
        val user = etchedUserRepository.findByUsername(authRequest.username)!!
        EtchedApplication.log.info("{} logged in.", authRequest.username)
        return JwtResponse(jwtTokenUtils.generateToken(user))
    }

    @RequestMapping("/register", method = [RequestMethod.POST])
    override fun register(@RequestBody registerRequest: RegisterRequest): JwtResponse {
        // TODO: Handle usernames as case insensitive
        // I.e. usernames are still displayed with case sensitivity but are treated as case
        // insensitive.
        validateRegisterRequest(registerRequest)
        EtchedApplication.log.info("Received register request with: {}", registerRequest)
        val hashedPassword = bCryptPasswordEncoder.encode(registerRequest.password)
        var subjectHubUser = EtchedUser(null, registerRequest.username, hashedPassword,
                registerRequest.email)
        subjectHubUser = etchedUserRepository.save(subjectHubUser)

        EtchedApplication.log.info("{} successfully registered.", registerRequest.username)
        return JwtResponse(jwtTokenUtils.generateToken(subjectHubUser))
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
