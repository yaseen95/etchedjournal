package com.etchedjournal.etched.security.jwt

import com.etchedjournal.etched.service.exception.BadRequestException

class JwtException(message: String) : BadRequestException(message = message)
