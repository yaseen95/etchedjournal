package com.etchedjournal.etched.api

import com.etchedjournal.etched.dto.AuthenticationRequest
import com.etchedjournal.etched.dto.JwtResponse
import com.etchedjournal.etched.dto.RegisterRequest

interface AuthServiceApi {

    fun authenticate(authRequest: AuthenticationRequest): JwtResponse

    fun register(registerRequest: RegisterRequest): JwtResponse
}
